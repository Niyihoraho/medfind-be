// ─── FACILITY SERVICE ────────────────────────────────────────────
// Business logic for facility search, CRUD, and Haversine sorting.

import prisma from '../lib/prisma';
import { haversineDistance } from '../lib/haversine';
import { Prisma } from '@prisma/client';

interface SearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  sector_id?: number;
  district_id?: number;
  province_id?: number;
  service_id?: number;
  insurance_id?: number;
  type?: string;
  verified?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Helper to serialize BigInt values to numbers in JSON responses
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (obj instanceof Date) return obj;
  if (typeof obj === 'object' && obj.constructor === Object || Array.isArray(obj)) {
    const result: any = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  // Handle Prisma Decimal
  if (typeof obj === 'object' && obj.constructor && obj.constructor.name === 'Decimal') {
    return Number(obj);
  }
  return obj;
}

export const facilityService = {
  async search(params: SearchParams) {
    const {
      lat, lng, radius = 10,
      sector_id, district_id, province_id,
      service_id, insurance_id, type,
      verified = 1, search,
      sort = 'name', page = 1, limit = 20,
    } = params;

    // Build where clause
    const where: Prisma.FacilityWhereInput = {};

    // Verified filter
    if (verified === 1) {
      where.isVerified = true;
    }

    // Type filter
    if (type) {
      where.type = type as any;
    }

    // Name search
    if (search) {
      where.name = { contains: search };
    }

    // Location filters (GPS-off)
    if (sector_id) {
      where.sectorId = BigInt(sector_id);
    } else if (district_id) {
      where.sector = { districtId: BigInt(district_id) };
    } else if (province_id) {
      where.sector = { district: { provinceId: BigInt(province_id) } };
    }

    // Service filter
    if (service_id) {
      where.services = { some: { serviceId: BigInt(service_id), isAvailable: true } };
    }

    // Insurance filter: if under organization, check organization; else check facility
    if (insurance_id) {
      const insId = BigInt(insurance_id);
      where.OR = [
        {
          organizationId: null,
          insurances: { some: { insuranceId: insId } }
        },
        {
          organizationId: { not: null },
          organization: {
            insurances: { some: { insuranceId: insId } }
          }
        }
      ];
    }

    // Fetch facilities with relations
    const facilities = await prisma.facility.findMany({
      where,
      include: {
        sector: {
          include: {
            district: {
              include: { province: true },
            },
          },
        },
        services: { include: { service: true } },
        insurances: { include: { insurance: true } },
        organization: {
          include: {
            insurances: { include: { insurance: true } }
          }
        },
      },
      orderBy: sort === 'name' ? { name: 'asc' } : undefined,
    });

    // Calculate distances and sort if GPS coordinates provided
    let refLat = lat;
    let refLng = lng;

    // GPS-off fallback: use sector center
    if (!refLat && !refLng && sector_id) {
      const center = await prisma.placeCenter.findUnique({
        where: { unique_place: { placeType: 'sector', placeId: BigInt(sector_id) } },
      });
      if (center) {
        refLat = Number(center.centerLat);
        refLng = Number(center.centerLng);
      }
    }

    let results = facilities.map((f) => {
      const serialized = serializeBigInt(f);
      let distance: number | null = null;

      if (refLat && refLng && f.latitude && f.longitude) {
        distance = haversineDistance(refLat, refLng, Number(f.latitude), Number(f.longitude));
        distance = Math.round(distance * 100) / 100; // round to 2 decimals
      }

      return {
        ...serialized,
        distance,
        location: {
          sector: f.sector.name,
          district: f.sector.district.name,
          province: f.sector.district.province.name,
        },
        // Override insurances if organization exists
        insurances: f.organizationId && f.organization?.insurances 
          ? serializeBigInt(f.organization.insurances) 
          : serialized.insurances,
      };
    });

    // Filter by radius if GPS used
    if (refLat && refLng) {
      results = results.filter((f) => f.distance === null || f.distance <= radius);
    }

    // Sort by distance if requested and GPS is available
    if (sort === 'distance' && refLat && refLng) {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    // Pagination
    const total = results.length;
    const startIdx = (page - 1) * limit;
    const paginated = results.slice(startIdx, startIdx + limit);

    return {
      facilities: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number) {
    const facility = await prisma.facility.findUnique({
      where: { id: BigInt(id) },
      include: {
        sector: {
          include: {
            district: {
              include: { province: true },
            },
          },
        },
        services: { include: { service: true } },
        insurances: { include: { insurance: true } },
        admins: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, role: true },
            },
          },
        },
        organization: {
          include: {
            insurances: { include: { insurance: true } }
          }
        },
      },
    });

    if (!facility) {
      throw { status: 404, message: 'Facility not found' };
    }

    const serialized = serializeBigInt(facility);

    return {
      ...serialized,
      location: {
        sector: facility.sector.name,
        district: facility.sector.district.name,
        province: facility.sector.district.province.name,
      },
      // Override insurances if organization exists and is private
      insurances: facility.organizationId && facility.organization?.ownershipType === 'private' && facility.organization?.insurances 
        ? serializeBigInt(facility.organization.insurances) 
        : serialized.insurances,
    };
  },

  async create(data: any) {
    let lat = data.latitude;
    let lng = data.longitude;

    if (lat == null || lng == null) {
      const center = await prisma.placeCenter.findUnique({
        where: { unique_place: { placeType: 'sector', placeId: BigInt(data.sector_id) } },
      });
      if (center) {
        lat = Number(center.centerLat);
        lng = Number(center.centerLng);
      }
    }

    const facility = await prisma.facility.create({
      data: {
        name: data.name,
        type: data.type,
        address: data.address,
        latitude: lat,
        longitude: lng,
        sectorId: BigInt(data.sector_id),
        cellId: data.cell_id && String(data.cell_id) !== '0' && String(data.cell_id) !== 'null' ? BigInt(data.cell_id) : null,
        villageId: data.village_id && String(data.village_id) !== '0' && String(data.village_id) !== 'null' ? BigInt(data.village_id) : null,
        phone: data.phone,
        email: data.email,
        openingHours: data.opening_hours,
        isVerified: false,
        category: data.category || 'public',
        organizationId: data.organization_id && String(data.organization_id) !== '0' && String(data.organization_id) !== 'null' ? BigInt(data.organization_id) : null,
        isPartner: data.isPartner === 'true' || data.isPartner === true,
        imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : null,
      },
      include: {
        sector: { include: { district: { include: { province: true } } } },
      },
    });

    return serializeBigInt(facility);
  },

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.sector_id !== undefined) updateData.sectorId = BigInt(data.sector_id);
    if (data.cell_id !== undefined) updateData.cellId = data.cell_id && String(data.cell_id) !== '0' && String(data.cell_id) !== 'null' ? BigInt(data.cell_id) : null;
    if (data.village_id !== undefined) updateData.villageId = data.village_id && String(data.village_id) !== '0' && String(data.village_id) !== 'null' ? BigInt(data.village_id) : null;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.opening_hours !== undefined) updateData.openingHours = data.opening_hours;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.organization_id !== undefined) updateData.organizationId = data.organization_id && String(data.organization_id) !== '0' && String(data.organization_id) !== 'null' ? BigInt(data.organization_id) : null;
    if (data.isPartner !== undefined) updateData.isPartner = data.isPartner === 'true' || data.isPartner === true;
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : null;
    }

    if (updateData.latitude === null || updateData.longitude === null) {
       const targetSectorId = updateData.sectorId ? updateData.sectorId : (await prisma.facility.findUnique({ where: { id: BigInt(id) } }))?.sectorId;
       
       if (targetSectorId) {
         const center = await prisma.placeCenter.findUnique({
           where: { unique_place: { placeType: 'sector', placeId: targetSectorId } },
         });
         if (center) {
           updateData.latitude = Number(center.centerLat);
           updateData.longitude = Number(center.centerLng);
         }
       }
    }

    const facility = await prisma.facility.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        sector: { include: { district: { include: { province: true } } } },
        services: { include: { service: true } },
        insurances: { include: { insurance: true } },
      },
    });

    return serializeBigInt(facility);
  },

  async verify(id: number) {
    const facility = await prisma.facility.update({
      where: { id: BigInt(id) },
      data: { isVerified: true },
    });
    return serializeBigInt(facility);
  },

  async remove(id: number) {
    await prisma.facility.delete({ where: { id: BigInt(id) } });
  },
};

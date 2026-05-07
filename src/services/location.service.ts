// ─── LOCATION SERVICE ────────────────────────────────────────────
// Business logic for administrative geography queries.

import prisma from '../lib/prisma';

export const locationService = {
  async getProvinces() {
    return prisma.province.findMany({ orderBy: { name: 'asc' } });
  },

  async getDistrictsByProvince(provinceId: number) {
    return prisma.district.findMany({
      where: { provinceId: BigInt(provinceId) },
      orderBy: { name: 'asc' },
    });
  },

  async getSectorsByDistrict(districtId: number) {
    return prisma.sector.findMany({
      where: { districtId: BigInt(districtId) },
      orderBy: { name: 'asc' },
    });
  },
  
  async getCellsBySector(sectorId: number) {
    return prisma.cell.findMany({
      where: { sectorId: BigInt(sectorId) },
      orderBy: { name: 'asc' },
    });
  },

  async getVillagesByCell(cellId: number) {
    return prisma.village.findMany({
      where: { cellId: BigInt(cellId) },
      orderBy: { name: 'asc' },
    });
  },

  async getPlaceCenter(type: string, id: number) {
    const placeCenter = await prisma.placeCenter.findUnique({
      where: {
        unique_place: {
          placeType: type as any,
          placeId: BigInt(id),
        },
      },
    });

    if (!placeCenter) {
      throw { status: 404, message: `Place center not found for ${type} ${id}` };
    }

    return placeCenter;
  },
};

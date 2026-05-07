// ─── ADMIN CONTROLLER ────────────────────────────────────────────
// Super admin endpoints: user management + facility admin assignment.

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

function serialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export const adminController = {
  // ─── USER MANAGEMENT ────────────────────────────────────────────

  async getUsers(_req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: serialize(users), message: 'Users retrieved' });
  },

  async updateUserRole(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    const { role } = req.body;

    if (!['patient', 'facility_admin', 'super_admin'].includes(role)) {
      return res.status(422).json({ success: false, error: 'Invalid role', code: 422 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, fullName: true, email: true, role: true },
    });

    res.json({ success: true, data: serialize(user), message: 'User role updated' });
  },

  async createUser(req: Request, res: Response) {
    const { fullName, email, password, role, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: role || 'patient',
        phone,
      },
    });

    res.status(201).json({ success: true, data: serialize(user), message: 'User created' });
  },

  async deleteUser(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'User deleted' });
  },

  // ─── ORGANIZATION MANAGEMENT ─────────────────────────────────────

  async getOrganizations(_req: Request, res: Response) {
    const orgs = await prisma.organization.findMany({
      include: { 
        _count: { select: { facilities: true } },
        insurances: { include: { insurance: true } }
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: serialize(orgs), message: 'Organizations retrieved' });
  },

  async createOrganization(req: Request, res: Response) {
    const { name, email, phone, ownershipType } = req.body;
    const org = await prisma.organization.create({
      data: { name, email, phone, ownershipType },
      include: { 
        _count: { select: { facilities: true } },
        insurances: { include: { insurance: true } }
      }
    });
    res.status(201).json({ success: true, data: serialize(org), message: 'Organization created' });
  },

  async updateOrganization(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    const { name, email, phone, ownershipType } = req.body;
    const org = await prisma.organization.update({
      where: { id },
      data: { name, email, phone, ownershipType },
      include: { 
        _count: { select: { facilities: true } },
        insurances: { include: { insurance: true } }
      }
    });
    res.json({ success: true, data: serialize(org), message: 'Organization updated' });
  },

  async deleteOrganization(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    await prisma.organization.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'Organization deleted' });
  },

  // ─── ORGANIZATION INSURANCE ───────────────────────────────────────

  async addOrganizationInsurance(req: Request, res: Response) {
    const organizationId = BigInt(parseInt(String(req.params.id), 10));
    const insuranceId = BigInt(req.body.insurance_id);

    const result = await prisma.organizationInsurance.create({
      data: { organizationId, insuranceId },
      include: { insurance: true },
    });
    res.status(201).json({ success: true, data: serialize(result), message: 'Insurance added to organization' });
  },

  async removeOrganizationInsurance(req: Request, res: Response) {
    const organizationId = BigInt(parseInt(String(req.params.id), 10));
    const insuranceId = BigInt(parseInt(String(req.params.iid), 10));

    await prisma.organizationInsurance.delete({
      where: { unique_organization_insurance: { organizationId, insuranceId } },
    });
    res.json({ success: true, data: null, message: 'Insurance removed from organization' });
  },

  // ─── SERVICE MANAGEMENT ──────────────────────────────────────────

  async createService(req: Request, res: Response) {
    const { name, category, description } = req.body;
    const service = await prisma.service.create({
      data: { name, category, description },
    });
    res.status(201).json({ success: true, data: serialize(service), message: 'Service created' });
  },

  async updateService(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    const { name, category, description } = req.body;
    const service = await prisma.service.update({
      where: { id },
      data: { name, category, description },
    });
    res.json({ success: true, data: serialize(service), message: 'Service updated' });
  },

  async deleteService(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    await prisma.service.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'Service deleted' });
  },

  // ─── INSURANCE MANAGEMENT ────────────────────────────────────────

  async createInsurance(req: Request, res: Response) {
    const { name, type, description } = req.body;
    const insurance = await prisma.insuranceScheme.create({
      data: { name, type, description },
    });
    res.status(201).json({ success: true, data: serialize(insurance), message: 'Insurance created' });
  },

  async updateInsurance(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    const { name, type, description } = req.body;
    const insurance = await prisma.insuranceScheme.update({
      where: { id },
      data: { name, type, description },
    });
    res.json({ success: true, data: serialize(insurance), message: 'Insurance updated' });
  },

  async deleteInsurance(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    await prisma.insuranceScheme.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'Insurance deleted' });
  },

  // ─── LOCATION MANAGEMENT ─────────────────────────────────────────

  async createProvince(req: Request, res: Response) {
    const { name, nameRw } = req.body;
    const province = await prisma.province.create({ data: { name, nameRw } });
    res.status(201).json({ success: true, data: serialize(province), message: 'Province created' });
  },

  async deleteProvince(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    await prisma.province.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'Province deleted' });
  },

  async createDistrict(req: Request, res: Response) {
    const { name, nameRw, provinceId } = req.body;
    const district = await prisma.district.create({
      data: { name, nameRw, provinceId: BigInt(provinceId) },
    });
    res.status(201).json({ success: true, data: serialize(district), message: 'District created' });
  },

  async deleteDistrict(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    await prisma.district.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'District deleted' });
  },

  async createSector(req: Request, res: Response) {
    const { name, nameRw, districtId, lat, lng } = req.body;
    const sector = await prisma.sector.create({
      data: { name, nameRw, districtId: BigInt(districtId) },
    });

    if (lat && lng) {
      await prisma.placeCenter.upsert({
        where: { unique_place: { placeType: 'sector', placeId: sector.id } },
        create: { placeType: 'sector', placeId: sector.id, centerLat: lat, centerLng: lng },
        update: { centerLat: lat, centerLng: lng },
      });
    }

    res.status(201).json({ success: true, data: serialize(sector), message: 'Sector created' });
  },

  async deleteSector(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    await prisma.sector.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'Sector deleted' });
  },

  // ─── FACILITY ADMIN MANAGEMENT ──────────────────────────────────

  async getFacilityAdmins(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const admins = await prisma.facilityAdmin.findMany({
      where: { facilityId },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    });
    res.json({ success: true, data: serialize(admins), message: 'Facility admins retrieved' });
  },

  async assignFacilityAdmin(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const userId = BigInt(req.body.user_id);
    const role = req.body.role || 'editor';

    const assignment = await prisma.facilityAdmin.create({
      data: { facilityId, userId, role },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Also update user role to facility_admin if they're a patient
    await prisma.user.updateMany({
      where: { id: userId, role: 'patient' },
      data: { role: 'facility_admin' },
    });

    res.status(201).json({ success: true, data: serialize(assignment), message: 'Admin assigned to facility' });
  },

  async removeFacilityAdmin(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const userId = BigInt(parseInt(String(req.params.uid), 10));

    await prisma.facilityAdmin.delete({
      where: { unique_facility_user: { facilityId, userId } },
    });

    res.json({ success: true, data: null, message: 'Admin removed from facility' });
  },

  // ─── FACILITY ASSETS MANAGEMENT ─────────────────────────────────

  async addFacilityService(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const serviceId = BigInt(req.body.service_id);

    const result = await prisma.facilityService.create({
      data: { facilityId, serviceId, isAvailable: true },
      include: { service: true },
    });
    res.status(201).json({ success: true, data: serialize(result), message: 'Service added to facility' });
  },

  async removeFacilityService(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const serviceId = BigInt(parseInt(String(req.params.sid), 10));

    await prisma.facilityService.delete({
      where: { unique_facility_service: { facilityId, serviceId } },
    });
    res.json({ success: true, data: null, message: 'Service removed from facility' });
  },

  async addFacilityInsurance(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const insuranceId = BigInt(req.body.insurance_id);

    const result = await prisma.facilityInsurance.create({
      data: { facilityId, insuranceId },
      include: { insurance: true },
    });
    res.status(201).json({ success: true, data: serialize(result), message: 'Insurance added to facility' });
  },

  async removeFacilityInsurance(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const insuranceId = BigInt(parseInt(String(req.params.iid), 10));

    await prisma.facilityInsurance.delete({
      where: { unique_facility_insurance: { facilityId, insuranceId } },
    });
    res.json({ success: true, data: null, message: 'Insurance removed from facility' });
  },

  async getStats(_req: Request, res: Response) {
    const [facilities, users, orgs, services, pending] = await Promise.all([
      prisma.facility.count(),
      prisma.user.count(),
      prisma.organization.count(),
      prisma.service.count(),
      prisma.facility.count({ where: { isVerified: false } }),
    ]);

    res.json({
      success: true,
      data: {
        facilities,
        users,
        organizations: orgs,
        services,
        pendingVerification: pending,
      },
      message: 'System stats retrieved',
    });
  },
};

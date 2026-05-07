// ─── ORGANIZATION SERVICE ───────────────────────────────────────────
// Business logic for organizations and their shared insurances.

import prisma from '../lib/prisma';

// Helper to serialize BigInt values to numbers
function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export const organizationService = {
  async getAll() {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: { select: { facilities: true } },
        insurances: { include: { insurance: true } },
      },
      orderBy: { name: 'asc' },
    });
    return serializeBigInt(orgs);
  },

  async getById(id: number) {
    const org = await prisma.organization.findUnique({
      where: { id: BigInt(id) },
      include: {
        facilities: true,
        insurances: { include: { insurance: true } },
      },
    });
    if (!org) throw { status: 404, message: 'Organization not found' };
    return serializeBigInt(org);
  },

  async create(data: any) {
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        ownershipType: data.ownershipType || 'private',
      },
    });
    return serializeBigInt(org);
  },

  async update(id: number, data: any) {
    const org = await prisma.organization.update({
      where: { id: BigInt(id) },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        ownershipType: data.ownershipType,
      },
    });
    return serializeBigInt(org);
  },

  async remove(id: number) {
    await prisma.organization.delete({ where: { id: BigInt(id) } });
  },

  // ─── ORGANIZATION INSURANCES ───────────────────────────────────────

  async addInsurance(orgId: number, insuranceId: number) {
    const result = await prisma.organizationInsurance.create({
      data: {
        organizationId: BigInt(orgId),
        insuranceId: BigInt(insuranceId),
      },
      include: { insurance: true },
    });
    return serializeBigInt(result);
  },

  async removeInsurance(orgId: number, insuranceId: number) {
    await prisma.organizationInsurance.delete({
      where: {
        unique_organization_insurance: {
          organizationId: BigInt(orgId),
          insuranceId: BigInt(insuranceId),
        },
      },
    });
  },
};

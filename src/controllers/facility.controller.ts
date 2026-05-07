// ─── FACILITY CONTROLLER ─────────────────────────────────────────

import { Request, Response } from 'express';
import { facilityService } from '../services/facility.service';
import prisma from '../lib/prisma';

// Helper to serialize BigInt in responses
function serialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export const facilityController = {
  async search(req: Request, res: Response) {
    const result = await facilityService.search(req.query as any);
    res.json({ success: true, data: result, message: 'Facilities retrieved' });
  },

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const facility = await facilityService.getById(id);
      res.json({ success: true, data: facility, message: 'Facility retrieved' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.status || 500 });
    }
  },

  async create(req: Request, res: Response) {
    const data = { ...req.body };
    if (req.file) {
      // Store full Cloudinary URL
      data.imageUrl = req.file.path;
    }
    const facility = await facilityService.create(data);
    res.status(201).json({ success: true, data: facility, message: 'Facility created' });
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const data = { ...req.body };
      if (req.file) {
        data.imageUrl = req.file.path;
      }
      const facility = await facilityService.update(id, data);
      res.json({ success: true, data: facility, message: 'Facility updated' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.status || 500 });
    }
  },

  async verify(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const facility = await facilityService.verify(id);
      res.json({ success: true, data: facility, message: 'Facility verified' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.status || 500 });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      await facilityService.remove(id);
      res.json({ success: true, data: null, message: 'Facility deleted' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.status || 500 });
    }
  },

  // ─── FACILITY SERVICES MANAGEMENT ──────────────────────────────

  async addService(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const serviceId = BigInt(req.body.service_id);

    const result = await prisma.facilityService.create({
      data: { facilityId, serviceId, isAvailable: true },
      include: { service: true },
    });
    res.status(201).json({ success: true, data: serialize(result), message: 'Service added to facility' });
  },

  async removeService(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const serviceId = BigInt(parseInt(String(req.params.sid), 10));

    await prisma.facilityService.delete({
      where: { unique_facility_service: { facilityId, serviceId } },
    });
    res.json({ success: true, data: null, message: 'Service removed from facility' });
  },

  async toggleServiceAvailability(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const serviceId = BigInt(parseInt(String(req.params.sid), 10));

    const existing = await prisma.facilityService.findUnique({
      where: { unique_facility_service: { facilityId, serviceId } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Service not assigned to facility', code: 404 });
    }

    const updated = await prisma.facilityService.update({
      where: { unique_facility_service: { facilityId, serviceId } },
      data: { isAvailable: !existing.isAvailable },
      include: { service: true },
    });
    res.json({ success: true, data: serialize(updated), message: `Service ${updated.isAvailable ? 'enabled' : 'disabled'}` });
  },

  // ─── FACILITY INSURANCES MANAGEMENT ────────────────────────────

  async addInsurance(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const insuranceId = BigInt(req.body.insurance_id);

    const result = await prisma.facilityInsurance.create({
      data: { facilityId, insuranceId },
      include: { insurance: true },
    });
    res.status(201).json({ success: true, data: serialize(result), message: 'Insurance added to facility' });
  },

  async removeInsurance(req: Request, res: Response) {
    const facilityId = BigInt(parseInt(String(req.params.id), 10));
    const insuranceId = BigInt(parseInt(String(req.params.iid), 10));

    await prisma.facilityInsurance.delete({
      where: { unique_facility_insurance: { facilityId, insuranceId } },
    });
    res.json({ success: true, data: null, message: 'Insurance removed from facility' });
  },
};

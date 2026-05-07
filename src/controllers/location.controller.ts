// ─── LOCATION CONTROLLER ─────────────────────────────────────────

import { Request, Response } from 'express';
import { locationService } from '../services/location.service';

// Helper to serialize BigInt in responses
function serialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export const locationController = {
  async getProvinces(_req: Request, res: Response) {
    const provinces = await locationService.getProvinces();
    res.json({ success: true, data: serialize(provinces), message: 'Provinces retrieved' });
  },

  async getDistricts(req: Request, res: Response) {
    const id = parseInt(String(req.params.id), 10);
    const districts = await locationService.getDistrictsByProvince(id);
    res.json({ success: true, data: serialize(districts), message: 'Districts retrieved' });
  },

  async getSectors(req: Request, res: Response) {
    const id = parseInt(String(req.params.id), 10);
    const sectors = await locationService.getSectorsByDistrict(id);
    res.json({ success: true, data: serialize(sectors), message: 'Sectors retrieved' });
  },

  async getCells(req: Request, res: Response) {
    const id = parseInt(String(req.params.id), 10);
    const cells = await locationService.getCellsBySector(id);
    res.json({ success: true, data: serialize(cells), message: 'Cells retrieved' });
  },

  async getVillages(req: Request, res: Response) {
    const id = parseInt(String(req.params.id), 10);
    const villages = await locationService.getVillagesByCell(id);
    res.json({ success: true, data: serialize(villages), message: 'Villages retrieved' });
  },

  async getPlaceCenter(req: Request, res: Response) {
    try {
      const { type, id } = req.params;
      const center = await locationService.getPlaceCenter(String(type), parseInt(String(id), 10));
      res.json({ success: true, data: serialize(center), message: 'Place center retrieved' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.status || 500 });
    }
  },
};

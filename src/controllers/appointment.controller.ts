// ─── APPOINTMENT CONTROLLER ──────────────────────────────────────

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendBookingConfirmation, sendFacilityNotification, generateBookingRef } from '../lib/email';

function serialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export const appointmentController = {
  async getMyAppointments(req: Request, res: Response) {
    const appointments = await prisma.appointment.findMany({
      where: { userId: BigInt(req.user!.id) },
      include: {
        facility: {
          select: { id: true, name: true, type: true, phone: true, email: true, imageUrl: true },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });
    res.json({ success: true, data: serialize(appointments), message: 'Appointments retrieved' });
  },

  async getById(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    const userId = BigInt(req.user!.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        facility: {
          select: { id: true, name: true, type: true, phone: true, email: true, imageUrl: true, address: true },
        },
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found', code: 404 });
    }

    // Only allow the owner or admins to view
    if (appointment.userId !== userId && req.user!.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Access denied', code: 403 });
    }

    res.json({ success: true, data: serialize(appointment), message: 'Appointment retrieved' });
  },

  async create(req: Request, res: Response) {
    const userId = BigInt(req.user!.id);
    const facilityId = BigInt(req.body.facility_id);
    const appointmentDate = new Date(req.body.appointment_date);

    // Check for duplicate: same user + facility + same date
    const dateStart = new Date(appointmentDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(appointmentDate);
    dateEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.appointment.findFirst({
      where: {
        userId,
        facilityId,
        appointmentDate: { gte: dateStart, lte: dateEnd },
        status: { not: 'cancelled' },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'You already have an appointment at this facility on this date',
        code: 409,
      });
    }

    // Generate a booking reference
    const bookingRef = generateBookingRef();

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        facilityId,
        serviceName: req.body.service_name,
        appointmentDate,
        notes: req.body.notes,
      },
      include: {
        facility: { select: { id: true, name: true, type: true, phone: true, email: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Send confirmation emails (non-blocking)
    const emailDetails = {
      bookingRef,
      patientName: appointment.user.fullName,
      patientEmail: appointment.user.email,
      facilityName: appointment.facility.name,
      facilityPhone: appointment.facility.phone,
      facilityEmail: appointment.facility.email,
      serviceName: appointment.serviceName || 'General Consultation',
      appointmentDate,
      notes: appointment.notes,
    };

    // Fire-and-forget — don't await, don't block the response
    sendBookingConfirmation(emailDetails).catch(() => {});
    sendFacilityNotification(emailDetails).catch(() => {});

    res.status(201).json({
      success: true,
      data: { ...serialize(appointment), bookingRef },
      message: 'Appointment booked successfully. A confirmation email has been sent.',
    });
  },

  async updateStatus(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: req.body.status },
      include: {
        facility: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.json({ success: true, data: serialize(appointment), message: `Appointment ${req.body.status}` });
  },

  async cancel(req: Request, res: Response) {
    const id = BigInt(parseInt(String(req.params.id), 10));
    const userId = BigInt(req.user!.id);

    // Verify ownership
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.userId !== userId) {
      return res.status(403).json({ success: false, error: 'You can only cancel your own appointments', code: 403 });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json({ success: true, data: null, message: 'Appointment cancelled' });
  },
};

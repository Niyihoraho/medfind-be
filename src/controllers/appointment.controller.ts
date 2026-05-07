// ─── APPOINTMENT CONTROLLER ──────────────────────────────────────

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendBookingConfirmation, sendFacilityNotification, sendAdminNotification, generateBookingRef } from '../lib/email';

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
    const facilityId = BigInt(req.body.facility_id);
    const appointmentDate = new Date(req.body.appointment_date);

    // Fetch facility info for the email
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { name: true, phone: true, email: true }
    });

    if (!facility) {
      return res.status(404).json({ success: false, error: 'Facility not found', code: 404 });
    }

    // Generate a booking reference
    const bookingRef = generateBookingRef();

    // Prepare email details from request body and facility info
    const emailDetails = {
      bookingRef,
      patientName: req.body.full_name || 'Patient',
      patientEmail: req.body.email || '',
      patientPhone: req.body.phone || '',
      facilityName: facility.name,
      facilityPhone: facility.phone,
      facilityEmail: facility.email,
      serviceName: req.body.service_name || 'General Consultation',
      appointmentDate,
      notes: req.body.notes,
    };

    // Send confirmation emails (blocking for debug/ensure delivery)
    try {
      // 1. Send to Patient
      await sendBookingConfirmation(emailDetails);
      console.log(`✅ Confirmation email sent to patient: ${emailDetails.patientEmail}`);
      
      // 2. Send to Facility (if they have an email)
      if (emailDetails.facilityEmail) {
        await sendFacilityNotification(emailDetails);
        console.log(`✅ Notification email sent to facility: ${emailDetails.facilityEmail}`);
      } else {
        console.log(`ℹ️ Skipping facility email: No email address set for ${facility.name}`);
      }

      // 3. Send to MedFind Admin (Copy for records)
      await sendAdminNotification(emailDetails);
      console.log(`✅ Copy sent to MedFind Admin`);

    } catch (emailError) {
      console.error('❌ Failed to dispatch one or more emails:', emailError);
    }

    res.status(201).json({
      success: true,
      data: { 
        id: Math.floor(Math.random() * 1000000), // Virtual ID since we're not saving to DB
        bookingRef,
        appointmentDate,
        serviceName: req.body.service_name,
        patientName: req.body.full_name,
      },
      message: 'Appointment request sent successfully. A confirmation email has been dispatched.',
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

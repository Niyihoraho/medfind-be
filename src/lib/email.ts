// ─── EMAIL SERVICE ──────────────────────────────────────────────
// Sends transactional emails (booking confirmations, notifications)
// using Nodemailer with SMTP (Gmail or any provider).

import nodemailer from 'nodemailer';

// ─── TRANSPORTER ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@medfind.rw';
const APP_NAME = 'MedFind';

// ─── HTML TEMPLATE HELPERS ───────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin:0; padding:0; background-color:#f7faf8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-flex; align-items:center; gap:8px;">
        <div style="width:36px; height:36px; background:#4c763b; border-radius:8px; display:inline-flex; align-items:center; justify-content:center;">
          <span style="color:white; font-weight:bold; font-size:16px;">+</span>
        </div>
        <span style="font-size:22px; font-weight:700; color:#1a3a1a; letter-spacing:-0.5px;">MED<span style="color:#4c763b;">FIND</span></span>
      </div>
    </div>
    
    <!-- Content Card -->
    <div style="background:white; border-radius:16px; padding:32px; border:1px solid rgba(76,118,59,0.1); box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="text-align:center; margin-top:24px; color:#999; font-size:12px; line-height:1.6;">
      <p style="margin:0;">This email was sent by MedFind — Rwanda's Healthcare Facility Finder</p>
      <p style="margin:4px 0 0 0;">© ${new Date().getFullYear()} MedFind. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── EMAIL SENDERS ───────────────────────────────────────────────

interface BookingDetails {
  bookingRef: string;
  patientName: string;
  patientEmail: string;
  facilityName: string;
  facilityPhone?: string | null;
  facilityEmail?: string | null;
  serviceName: string;
  appointmentDate: Date;
  notes?: string | null;
}

/**
 * Send booking confirmation email to the patient.
 */
export async function sendBookingConfirmation(details: BookingDetails): Promise<void> {
  const { bookingRef, patientName, patientEmail, facilityName, facilityPhone, serviceName, appointmentDate, notes } = details;

  const content = `
    <div style="text-align:center; margin-bottom:24px;">
      <div style="width:56px; height:56px; background:linear-gradient(135deg, #4c763b, #1a3a1a); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <span style="color:white; font-size:28px;">✓</span>
      </div>
      <h1 style="margin:0; font-size:22px; color:#1a3a1a; font-weight:700;">Appointment Confirmed!</h1>
      <p style="margin:6px 0 0; color:#888; font-size:14px;">Your booking has been successfully received</p>
    </div>
    
    <div style="background:#f7faf8; border-radius:12px; padding:20px; margin-bottom:20px; border:1px solid rgba(76,118,59,0.08);">
      <p style="margin:0 0 4px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#999;">Booking Reference</p>
      <p style="margin:0; font-size:18px; font-weight:700; color:#4c763b; letter-spacing:1px;">${bookingRef}</p>
    </div>

    <p style="margin:0 0 16px; color:#555; font-size:14px;">Hi <strong>${patientName}</strong>, here are your appointment details:</p>
    
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px; width:120px;">Facility</td>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${facilityName}</td>
      </tr>
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px;">Service</td>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px;">Date</td>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${formatDate(appointmentDate)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px;">Time</td>
        <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${formatTime(appointmentDate)}</td>
      </tr>
      ${notes ? `
      <tr>
        <td style="padding:12px 0; color:#888; font-size:13px;">Notes</td>
        <td style="padding:12px 0; color:#555; font-size:14px; font-style:italic;">"${notes}"</td>
      </tr>` : ''}
    </table>
    
    ${facilityPhone ? `
    <div style="margin-top:20px; padding:14px; background:#f0f7ff; border-radius:10px; border:1px solid #d6e8ff;">
      <p style="margin:0; font-size:13px; color:#555;">
        📞 Need to reach the facility? Call <strong>${facilityPhone}</strong>
      </p>
    </div>` : ''}
    
    <div style="margin-top:24px; padding:16px; background:#fff8e6; border-radius:10px; border:1px solid #ffe8a0;">
      <p style="margin:0; font-size:13px; color:#7a6520; line-height:1.5;">
        ⏰ <strong>Reminder:</strong> Please arrive 15 minutes before your appointment time. Bring any relevant medical documents and your insurance card.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_ADDRESS}>`,
      to: patientEmail,
      subject: `✅ Appointment Confirmed — ${facilityName} | ${formatDate(appointmentDate)}`,
      html: baseTemplate(content),
    });
    console.log(`📧 Booking confirmation sent to ${patientEmail}`);
  } catch (error) {
    console.error('📧 Failed to send booking confirmation:', error);
    // Don't throw — email failure shouldn't block the booking
  }
}

/**
 * Send notification email to the facility about a new booking.
 */
export async function sendFacilityNotification(details: BookingDetails): Promise<void> {
  const { bookingRef, patientName, patientEmail, facilityName, facilityEmail, serviceName, appointmentDate, notes } = details;

  if (!facilityEmail) return;

  const content = `
    <div style="margin-bottom:20px;">
      <h1 style="margin:0; font-size:20px; color:#1a3a1a; font-weight:700;">📋 New Appointment Booking</h1>
      <p style="margin:6px 0 0; color:#888; font-size:14px;">A patient has booked an appointment at <strong>${facilityName}</strong></p>
    </div>
    
    <div style="background:#f7faf8; border-radius:12px; padding:16px; margin-bottom:20px; border:1px solid rgba(76,118,59,0.08);">
      <p style="margin:0 0 4px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#999;">Reference</p>
      <p style="margin:0; font-size:16px; font-weight:700; color:#4c763b;">${bookingRef}</p>
    </div>
    
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px; width:120px;">Patient</td>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${patientName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px;">Email</td>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#1a3a1a; font-size:14px;">${patientEmail}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px;">Service</td>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px;">Date</td>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${formatDate(appointmentDate)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#888; font-size:13px;">Time</td>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; font-weight:600; color:#1a3a1a; font-size:14px;">${formatTime(appointmentDate)}</td>
      </tr>
      ${notes ? `
      <tr>
        <td style="padding:10px 0; color:#888; font-size:13px;">Notes</td>
        <td style="padding:10px 0; color:#555; font-size:14px; font-style:italic;">"${notes}"</td>
      </tr>` : ''}
    </table>
    
    <div style="text-align:center; margin-top:24px;">
      <p style="color:#888; font-size:13px; margin:0;">Log in to your MedFind dashboard to manage this appointment.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_ADDRESS}>`,
      to: facilityEmail,
      subject: `📋 New Booking: ${patientName} — ${serviceName} | ${formatDate(appointmentDate)}`,
      html: baseTemplate(content),
    });
    console.log(`📧 Facility notification sent to ${facilityEmail}`);
  } catch (error) {
    console.error('📧 Failed to send facility notification:', error);
  }
}

/**
 * Generate a human-readable booking reference.
 */
export function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'MF-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

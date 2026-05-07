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
<body style="margin:0; padding:0; background-color:#f8fafc; font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <!-- Brand Header -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-flex; align-items:center; gap:12px;">
        <div style="width:40px; height:40px; background:#4c763b; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;">
          <span style="color:white; font-weight:bold; font-size:20px;">+</span>
        </div>
        <div style="text-align:left; margin-left:10px;">
          <span style="font-size:22px; font-weight:800; color:#1a3a1a; letter-spacing:-0.5px; display:block; line-height:1;">MED<span style="color:#4c763b;">FIND</span></span>
          <span style="font-size:9px; color:#4c763b; text-transform:uppercase; letter-spacing:1.5px; font-weight:700;">Rwanda Health</span>
        </div>
      </div>
    </div>
    
    <!-- Content Card -->
    <div style="background:white; border-radius:20px; padding:40px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="text-align:center; margin-top:32px; color:#94a3b8; font-size:12px; line-height:1.6;">
      <p style="margin:0; font-weight:600; color:#64748b;">MedFind Rwanda</p>
      <p style="margin:4px 0;">Need help? <a href="mailto:support@medfind.rw" style="color:#4c763b; text-decoration:none;">support@medfind.rw</a></p>
      <p style="margin:12px 0 0 0;">© ${new Date().getFullYear()} MedFind. All rights reserved.</p>
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

export interface BookingDetails {
  bookingRef: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string | null;
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
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:64px; height:64px; background:rgba(76,118,59,0.1); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
        <span style="color:#4c763b; font-size:32px; font-weight:bold;">✓</span>
      </div>
      <h1 style="margin:0; font-size:24px; color:#1a3a1a; font-weight:800; letter-spacing:-0.5px;">Appointment Confirmed</h1>
      <p style="margin:8px 0 0; color:#718096; font-size:15px;">We've received your booking at ${facilityName}</p>
    </div>
    
    <div style="background:#f0f7f0; border-radius:16px; padding:24px; margin-bottom:32px; border:1px solid rgba(76,118,59,0.12); text-align:center;">
      <p style="margin:0 0 6px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#4c763b;">Booking Reference</p>
      <p style="margin:0; font-size:22px; font-weight:800; color:#1a3a1a; letter-spacing:2px;">${bookingRef}</p>
    </div>

    <div style="margin-bottom:24px;">
      <h3 style="margin:0 0 12px; font-size:16px; color:#1a3a1a; font-weight:700; border-left:4px solid #4c763b; padding-left:12px;">Visit Details</h3>
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:14px 0; border-bottom:1px solid #edf2f7; color:#718096; font-size:14px;">Service</td>
          <td style="padding:14px 0; border-bottom:1px solid #edf2f7; font-weight:700; color:#1a3a1a; font-size:15px; text-align:right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding:14px 0; border-bottom:1px solid #edf2f7; color:#718096; font-size:14px;">Date</td>
          <td style="padding:14px 0; border-bottom:1px solid #edf2f7; font-weight:700; color:#1a3a1a; font-size:15px; text-align:right;">${formatDate(appointmentDate)}</td>
        </tr>
        ${notes ? `
        <tr>
          <td style="padding:14px 0; color:#718096; font-size:14px; vertical-align:top;">Your Notes</td>
          <td style="padding:14px 0; color:#4a5568; font-size:14px; font-style:italic; text-align:right;">"${notes}"</td>
        </tr>` : ''}
      </table>
    </div>
    
    <div style="background:#fffaf0; border-radius:16px; padding:20px; border:1px solid #feebc8; margin-top:10px;">
      <p style="margin:0; font-size:14px; color:#744210; line-height:1.6;">
        <strong>Important:</strong> Please arrive at <strong>${facilityName}</strong> 15 minutes before your scheduled time. ${facilityPhone ? `For queries, call the facility directly at <strong style="color:#1a3a1a;">${facilityPhone}</strong>.` : ''}
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
  }
}

/**
 * Send notification email to the facility about a new booking.
 */
export async function sendFacilityNotification(details: BookingDetails): Promise<void> {
  const { bookingRef, patientName, patientEmail, patientPhone, facilityName, facilityEmail, serviceName, appointmentDate, notes } = details;

  if (!facilityEmail) return;

  const content = `
    <div style="margin-bottom:24px;">
      <h1 style="margin:0; font-size:22px; color:#1a3a1a; font-weight:800;">📋 New Booking Received</h1>
      <p style="margin:6px 0 0; color:#718096; font-size:15px;">A new patient has scheduled an appointment</p>
    </div>
    
    <div style="background:#f8fafc; border-radius:16px; padding:24px; margin-bottom:32px; border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#718096;">Patient Contact</p>
      <p style="margin:0; font-size:18px; font-weight:700; color:#1a3a1a;">${patientName}</p>
      <p style="margin:4px 0 0; color:#4c763b; font-weight:600;">${patientEmail}</p>
      <p style="margin:2px 0 0; color:#718096;">${patientPhone || 'No phone provided'}</p>
    </div>
    
    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <tr>
        <td style="padding:14px 0; border-bottom:1px solid #edf2f7; color:#718096; font-size:14px;">Service</td>
        <td style="padding:14px 0; border-bottom:1px solid #edf2f7; font-weight:700; color:#1a3a1a; font-size:15px; text-align:right;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding:14px 0; border-bottom:1px solid #edf2f7; color:#718096; font-size:14px;">Date</td>
        <td style="padding:14px 0; border-bottom:1px solid #edf2f7; font-weight:700; color:#1a3a1a; font-size:15px; text-align:right;">${formatDate(appointmentDate)}</td>
      </tr>
      <tr>
        <td style="padding:14px 0; border-bottom:1px solid #edf2f7; color:#718096; font-size:14px;">Time</td>
        <td style="padding:14px 0; border-bottom:1px solid #edf2f7; font-weight:700; color:#1a3a1a; font-size:15px; text-align:right;">${formatTime(appointmentDate)}</td>
      </tr>
      ${notes ? `
      <tr>
        <td style="padding:14px 0; color:#718096; font-size:14px; vertical-align:top;">Patient Notes</td>
        <td style="padding:14px 0; color:#4a5568; font-size:14px; font-style:italic; text-align:right;">"${notes}"</td>
      </tr>` : ''}
    </table>
    
    <div style="text-align:center; padding:16px; background:#f7faf8; border-radius:12px; border:1px solid rgba(76,118,59,0.1);">
      <p style="color:#4c763b; font-size:13px; margin:0; font-weight:600;">Ref: ${bookingRef}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME} Notifications" <${FROM_ADDRESS}>`,
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
 * Send notification email to the MedFind admin team.
 */
export async function sendAdminNotification(details: BookingDetails): Promise<void> {
  const { bookingRef, patientName, patientEmail, patientPhone, facilityName, serviceName, appointmentDate, notes } = details;
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@medfind.rw';

  const content = `
    <div style="margin-bottom:24px; border-bottom:2px solid #edf2f7; padding-bottom:16px;">
      <h1 style="margin:0; font-size:20px; color:#1a3a1a; font-weight:800;">New Booking</h1>
      <p style="margin:4px 0 0; color:#718096; font-size:14px;">A new appointment has been processed via MedFind</p>
    </div>
    
    <div style="background:#f8fafc; border-radius:12px; padding:16px; border:1px solid #e2e8f0; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:10px; font-weight:700; color:#a0aec0; text-transform:uppercase;">Patient Info</p>
      <p style="margin:0; font-size:14px; font-weight:700; color:#1a3a1a;">${patientName}</p>
      <p style="margin:2px 0; font-size:12px; color:#718096;">${patientEmail}</p>
      <p style="margin:0; font-size:12px; color:#718096;">${patientPhone || 'No phone'}</p>
    </div>

    <div style="background:white; border-radius:12px; border:1px solid #edf2f7; overflow:hidden;">
      <table style="width:100%; border-collapse:collapse;">
        <tr style="background:#f7faf8;">
          <td style="padding:12px; font-size:12px; font-weight:700; color:#4c763b; border-bottom:1px solid #edf2f7;">FACILITY</td>
          <td style="padding:12px; font-size:14px; font-weight:700; color:#1a3a1a; border-bottom:1px solid #edf2f7; text-align:right;">${facilityName}</td>
        </tr>
        <tr>
          <td style="padding:12px; font-size:12px; color:#718096; border-bottom:1px solid #edf2f7;">SERVICE</td>
          <td style="padding:12px; font-size:14px; font-weight:600; color:#1a3a1a; border-bottom:1px solid #edf2f7; text-align:right;">${serviceName}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:12px; font-size:12px; color:#718096;">DATE/TIME</td>
          <td style="padding:12px; font-size:14px; font-weight:700; color:#4c763b; text-align:right;">${formatDate(appointmentDate)} @ ${formatTime(appointmentDate)}</td>
        </tr>
      </table>
    </div>

    <div style="margin-top:20px; padding:12px; background:#f1f5f9; border-radius:8px; font-family:monospace; font-size:12px; color:#475569; text-align:center;">
      REF: ${bookingRef}
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME} System" <${FROM_ADDRESS}>`,
      to: adminEmail,
      subject: `🚨 NEW BOOKING: ${patientName} @ ${facilityName}`,
      html: baseTemplate(content),
    });
    console.log(`📧 Admin notification sent to ${adminEmail}`);
  } catch (error) {
    console.error('📧 Failed to send admin notification:', error);
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

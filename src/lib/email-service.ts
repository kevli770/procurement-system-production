// lib/email-service.ts
// Email service for sending notifications and documents

import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

// Email configuration from database or environment
async function getEmailConfig() {
  // For now, use environment variables
  // In production, this could be fetched from Settings table
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  };
}

// Create transporter
async function createTransporter() {
  const config = await getEmailConfig();

  if (!config.auth.user || !config.auth.pass) {
    console.warn('SMTP credentials not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport(config);
}

// Log email sending
async function logEmail(
  to: string,
  subject: string,
  body: string,
  status: 'SENT' | 'FAILED',
  errorMessage?: string
) {
  try {
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        body,
        status,
        errorMessage: errorMessage || null,
        sentAt: status === 'SENT' ? new Date() : null,
      },
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

// Send email with logging
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>
) {
  const transporter = await createTransporter();

  if (!transporter) {
    console.warn(`Email not sent to ${to} - SMTP not configured`);
    await logEmail(to, subject, html, 'FAILED', 'SMTP not configured');
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments,
    });

    await logEmail(to, subject, html, 'SENT');
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to send email to ${to}:`, errorMessage);
    await logEmail(to, subject, html, 'FAILED', errorMessage);
    return false;
  }
}

// Send approval notification to approver
export async function sendApprovalNotification(
  approverEmail: string,
  approverName: string,
  poNumber: string,
  creatorName: string,
  totalAmount: number,
  poId: string
) {
  const subject = `דרוש אישור להזמנת רכש ${poNumber}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const approvalUrl = `${appUrl}/approvals`;
  const poUrl = `${appUrl}/purchase-orders/${poId}`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .footer { text-align: center; color: #6b7280; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>דרוש אישור להזמנת רכש</h1>
        </div>
        <div class="content">
          <p>שלום ${approverName},</p>
          <p>הזמנת רכש חדשה ממתינה לאישור שלך:</p>

          <div class="details">
            <p><strong>מספר הזמנה:</strong> ${poNumber}</p>
            <p><strong>נוצרה על ידי:</strong> ${creatorName}</p>
            <p><strong>סכום כולל:</strong> ₪${totalAmount.toLocaleString('he-IL')}</p>
          </div>

          <p style="text-align: center;">
            <a href="${poUrl}" class="button">צפה בהזמנה</a>
            <a href="${approvalUrl}" class="button">מעבר לאישורים</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            אנא עבור למערכת לצפייה בפרטים המלאים ולאישור או דחיית ההזמנה.
          </p>
        </div>
        <div class="footer">
          <p>מערכת רכש - Procurement System</p>
          <p>הודעה זו נשלחה אוטומטית, אין להשיב עליה.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(approverEmail, subject, html);
}

// Send PO approved notification to creator
export async function sendPOApprovedNotification(
  creatorEmail: string,
  creatorName: string,
  poNumber: string,
  approverName: string,
  totalAmount: number,
  poId: string
) {
  const subject = `הזמנת רכש ${poNumber} אושרה`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const poUrl = `${appUrl}/purchase-orders/${poId}`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ הזמנת רכש אושרה</h1>
        </div>
        <div class="content">
          <p>שלום ${creatorName},</p>
          <p>הזמנת הרכש שלך אושרה בהצלחה:</p>

          <div class="details">
            <p><strong>מספר הזמנה:</strong> ${poNumber}</p>
            <p><strong>אושר על ידי:</strong> ${approverName}</p>
            <p><strong>סכום כולל:</strong> ₪${totalAmount.toLocaleString('he-IL')}</p>
          </div>

          <p style="text-align: center;">
            <a href="${poUrl}" class="button">צפה בהזמנה</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            ההזמנה נשלחה אוטומטית לספק.
          </p>
        </div>
        <div class="footer">
          <p>מערכת רכש - Procurement System</p>
          <p>הודעה זו נשלחה אוטומטית, אין להשיב עליה.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(creatorEmail, subject, html);
}

// Send PO rejected notification to creator
export async function sendPORejectedNotification(
  creatorEmail: string,
  creatorName: string,
  poNumber: string,
  approverName: string,
  rejectionReason: string,
  totalAmount: number,
  poId: string
) {
  const subject = `הזמנת רכש ${poNumber} נדחתה`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const poUrl = `${appUrl}/purchase-orders/${poId}`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .reason { background-color: #fef2f2; border-right: 4px solid #dc2626; padding: 12px; margin: 15px 0; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✗ הזמנת רכש נדחתה</h1>
        </div>
        <div class="content">
          <p>שלום ${creatorName},</p>
          <p>הזמנת הרכש שלך נדחתה:</p>

          <div class="details">
            <p><strong>מספר הזמנה:</strong> ${poNumber}</p>
            <p><strong>נדחתה על ידי:</strong> ${approverName}</p>
            <p><strong>סכום:</strong> ₪${totalAmount.toLocaleString('he-IL')}</p>
          </div>

          <div class="reason">
            <p><strong>סיבת הדחייה:</strong></p>
            <p>${rejectionReason || 'לא צוינה סיבה'}</p>
          </div>

          <p style="text-align: center;">
            <a href="${poUrl}" class="button">צפה בהזמנה</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            ניתן לערוך את ההזמנה ולהגיש שוב לאישור.
          </p>
        </div>
        <div class="footer">
          <p>מערכת רכש - Procurement System</p>
          <p>הודעה זו נשלחה אוטומטית, אין להשיב עליה.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(creatorEmail, subject, html);
}

// Send PO to supplier with PDF attachment
export async function sendPOToSupplier(
  supplierEmail: string,
  supplierName: string,
  poNumber: string,
  totalAmount: number,
  pdfBuffer: Buffer
) {
  const subject = `הזמנת רכש ${poNumber}`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; color: #6b7280; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>הזמנת רכש חדשה</h1>
        </div>
        <div class="content">
          <p>שלום ${supplierName},</p>
          <p>מצורפת הזמנת רכש מאושרת:</p>

          <div class="details">
            <p><strong>מספר הזמנה:</strong> ${poNumber}</p>
            <p><strong>סכום כולל:</strong> ₪${totalAmount.toLocaleString('he-IL')}</p>
          </div>

          <p>אנא עיין בקובץ המצורף לפרטים המלאים.</p>

          <p>בברכה,<br>מחלקת רכש</p>
        </div>
        <div class="footer">
          <p>מערכת רכש - Procurement System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(supplierEmail, subject, html, [
    {
      filename: `${poNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ]);
}

import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

let transporter: nodemailer.Transporter | null = null;

// Initialize email transporter
export function initializeEmail(config: EmailConfig) {
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for other ports
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
  });

  return transporter;
}

// Get email transporter
export function getTransporter() {
  if (!transporter) {
    // Initialize with environment variables if not initialized
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
      from: process.env.SMTP_FROM || "noreply@pokayoke.com",
      fromName: process.env.SMTP_FROM_NAME || "Kasai Pokayoke",
    };

    transporter = initializeEmail(config);
  }

  return transporter;
}

// Send email
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    const config: any = {
      from: `${process.env.SMTP_FROM_NAME || "Kasai Pokayoke"} <${process.env.SMTP_FROM || "noreply@pokayoke.com"}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || "",
    };

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      config.attachments = options.attachments;
    }

    await transport.sendMail(config);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string,
  onlySendCode: boolean = false,
): Promise<boolean> {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  let wording = `
    <p>Terima kasih telah mendaftar di Kasai Pokayoke. Untuk mengaktifkan akun Anda, silakan konfirmasi email Anda dengan mengklik tombol di bawah ini:</p>
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">Konfirmasi Email</a>
    </p>
    <p>Atau salin link berikut ke browser Anda:</p>
    <p style="word-break: break-all; color: #4CAF50;">${verificationUrl}</p>
    <p><strong>Catatan:</strong> Link ini akan kedaluwarsa dalam 24 jam.</p>
  `;

  if (onlySendCode) {
    wording = `
    <p>Gunakan kode berikut untuk melakukan konfirmasi</p>
    <p style="word-break: break-all; color: #4CAF50;">${verificationToken}</p>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          color: #777;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kasai Pokayoke</h1>
        </div>
        <div class="content">
          <h2>Konfirmasi Email Anda</h2>
          <p>Halo <strong>${username}</strong>,</p>
          ${wording}
        </div>
        <div class="footer">
          <p>Email ini dikirimkan secara otomatis. Jangan balas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} Kasai Pokayoke. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Kasai Pokayoke

    Konfirmasi Email Anda

    Halo ${username},

    Terima kasih telah mendaftar di Kasai Pokayoke. Untuk mengaktifkan akun Anda, silakan kunjungi link berikut:

    ${verificationUrl}

    Catatan: Link ini akan kedaluwarsa dalam 24 jam.

    Email ini dikirimkan secara otomatis. Jangan balas email ini.
    © ${new Date().getFullYear()} Kasai Pokayoke. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: "Konfirmasi Email - Kasai Pokayoke",
    html,
    text,
  });
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string,
): Promise<boolean> {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #f44336;
          margin: 0;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #f44336;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px 15px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #777;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kasai Pokayoke</h1>
        </div>
        <div class="content">
          <h2>Reset Password</h2>
          <p>Halo <strong>${username}</strong>,</p>
          <p>Kami menerima permintaan untuk mereset password akun Anda. Jika Anda tidak membuat permintaan ini, silakan abaikan email ini.</p>
          <p>Untuk mereset password Anda, silakan klik tombol di bawah ini:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Atau salin link berikut ke browser Anda:</p>
          <p style="word-break: break-all; color: #f44336;">${resetUrl}</p>
          <div class="warning">
            <strong>Peringatan:</strong> Link ini akan kedaluwarsa dalam 1 jam.
          </div>
        </div>
        <div class="footer">
          <p>Email ini dikirimkan secara otomatis. Jangan balas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} Kasai Pokayoke. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Kasai Pokayoke

    Reset Password

    Halo ${username},

    Kami menerima permintaan untuk mereset password akun Anda. Jika Anda tidak membuat permintaan ini, silakan abaikan email ini.

    Untuk mereset password Anda, silakan kunjungi link berikut:

    ${resetUrl}

    Peringatan: Link ini akan kedaluwarsa dalam 1 jam.

    Email ini dikirimkan secara otomatis. Jangan balas email ini.
    © ${new Date().getFullYear()} Kasai Pokayoke. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: "Reset Password - Kasai Pokayoke",
    html,
    text,
  });
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch (error) {
    console.error("Email configuration verification failed:", error);
    return false;
  }
}

// Send revision notification email
export async function sendRevisionNotificationEmail(
  recipients: string[],
  customerName: string,
  customerAlias: string,
  revisionDetails: any[],
  fileBuffer: Buffer,
  fileName: string,
  userName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Group by sheet for counting
    const sheets = new Map<string, number>();
    revisionDetails.forEach((detail) => {
      const count = sheets.get(detail.sheet) || 0;
      sheets.set(detail.sheet, count + 1);
    });

    const totalRevisions = revisionDetails.length;

    // Format time in Asia/Jakarta timezone (WIB)
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formattedDateTime = new Intl.DateTimeFormat("id-ID", options).format(now);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #00479E;
            margin: 0;
          }
          .summary {
            background-color: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
          }
          .summary p {
            margin: 5px 0;
          }
          .info-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            color: #777;
            font-size: 12px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Kasai Pokayoke</h1>
          </div>

          <h2 style="color: #00479E;">📋 Revision Update Notification</h2>

          <div class="summary">
            <p><strong>Customer:</strong> ${customerName} (${customerAlias})</p>
            <p><strong>Total Data Updated:</strong> ${totalRevisions} items</p>
            <p><strong>Updated by:</strong> ${userName}</p>
            <p><strong>Date:</strong> ${formattedDateTime} (WIB)</p>
          </div>

          <div class="info-box">
            <p><strong>ℹ️ Informasi:</strong></p>
            <p>Detail revisi lengkap telah dilampirkan dalam file Excel. Silakan periksa file lampiran untuk melihat semua perubahan yang dilakukan.</p>
          </div>

          <div class="footer">
            <p>Email ini dikirimkan secara otomatis dari Kasai Pokayoke.</p>
            <p>&copy; ${new Date().getFullYear()} Kasai Pokayoke. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
KASAI POKAYOKE - REVISION UPDATE NOTIFICATION
================================================

Customer: ${customerName} (${customerAlias})
Total Data Updated: ${totalRevisions} items
Updated by: ${userName}
Date: ${formattedDateTime} (WIB)

INFO:
Detail revisi lengkap telah dilampirkan dalam file Excel. Silakan periksa file lampiran untuk melihat semua perubahan yang dilakukan.

---
Email ini dikirimkan secara otomatis dari Kasai Pokayoke.
© ${new Date().getFullYear()} Kasai Pokayoke. All rights reserved.
    `;

    // Send to all recipients
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        return await sendEmail({
          to: recipient,
          subject: `[Pokayoke] Revision Update Notification - ${customerAlias}`,
          html,
          text,
          attachments: [
            {
              filename: fileName,
              content: fileBuffer,
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ],
        });
      }),
    );

    const successCount = results.filter((r) => r).length;

    if (successCount === recipients.length) {
      return { success: true };
    } else if (successCount > 0) {
      return {
        success: true,
        error: `Email sent to ${successCount}/${recipients.length} recipients`,
      };
    } else {
      return {
        success: false,
        error: "Failed to send email to all recipients",
      };
    }
  } catch (error) {
    console.error("Error sending revision notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

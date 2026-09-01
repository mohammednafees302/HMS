import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { env, isDev } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

const initTransporter = async () => {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    // Real SMTP Configuration
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    logger.info('📧 SMTP Email Transporter initialized.');
  } else {
    // Mock Ethereal Account for local testing / development
    logger.warn('⚠️ No SMTP configuration found. Creating mock Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info('📧 Mock Ethereal Email Transporter initialized.');
  }
  return transporter;
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailer = await initTransporter();
  
  const mailOptions = {
    from: env.SMTP_FROM,
    to,
    subject: 'Your Verification Code - HMS',
    text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #0ea5e9;">HMS Account Verification</h2>
        <p>Hello,</p>
        <p>Use the following One-Time Password (OTP) to complete your registration. This code is valid for 10 minutes.</p>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  };

  const info = await mailer.sendMail(mailOptions);
  
  if (!env.SMTP_HOST || isDev) {
    logger.info(`✉️ OTP Email sent to ${to}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`\n======================================\n✉️ OTP Preview URL: ${nodemailer.getTestMessageUrl(info)}\n======================================\n`);
  }
};

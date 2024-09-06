import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Transporter } from 'nodemailer';

export const mailerConfig: Transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    minVersion: 'TLSv1.2',
    ciphers: 'TLS_AES_256_GCM_SHA384',
    rejectUnauthorized: false,
  },
  logger: false,
  debug: false,
  timeout: 30000,
} as SMTPTransport.Options);

import "dotenv/config";
import * as nodemailer from "nodemailer";
import type SMTPConnection from "nodemailer/lib/smtp-connection";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { CustomError } from "../../err/custom/Error.filter";

const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> =
  nodemailer.createTransport({
    service: "gmail",
    host: process.env.NODEMAILER_HOST,
    port: parseInt(process.env.NODEMAILER_PORT, 10),
    secure: process.env.NODEMAILER_SECURE === "true",
    tls: {
      rejectUnauthorized: true,
    },
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  } as SMTPConnection.Options);

export const sendEmail = async (subject: string, html: string, to?: string, pdfBuffer?: Buffer) => {
  try {
    const attachments = pdfBuffer
      ? [
          {
            filename: "multa.pdf",
            content: pdfBuffer,
          },
        ]
      : [];

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_FROM,
      to: to || process.env.NODEMAILER_FROM,
      subject,
      html,
      attachments,
    });

    console.log("E-mail enviado: %s", info.messageId);
  } catch (error) {
    throw new CustomError(`Erro ao enviar e-mail: ${error}`);
  } finally {
    transporter.close();
  }
};

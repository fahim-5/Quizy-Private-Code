import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables early so any importer gets configured values
dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: process.env.EMAIL_USER
    ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    : undefined,
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const from =
    process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@example.com";
  const info = await transport.sendMail({ from, to, subject, text, html });
  return info;
};

export default sendEmail;

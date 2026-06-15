import nodemailer from "nodemailer";

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  useTls: boolean;
}

export interface SenderInfo {
  name: string;
  email: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const { prisma } = await import("./prisma");
  const host = await prisma.setting.findUnique({ where: { key: "smtp_host" } });
  const port = await prisma.setting.findUnique({ where: { key: "smtp_port" } });
  const username = await prisma.setting.findUnique({ where: { key: "smtp_username" } });
  const password = await prisma.setting.findUnique({ where: { key: "smtp_password" } });
  const useTls = await prisma.setting.findUnique({ where: { key: "smtp_use_tls" } });

  if (!host?.value || !port?.value || !username?.value || !password?.value) return null;

  return {
    host: host.value,
    port: parseInt(port.value),
    username: username.value,
    password: password.value,
    useTls: useTls?.value !== "false",
  };
}

export async function getSenderInfo(): Promise<SenderInfo> {
  const { prisma } = await import("./prisma");
  const name = await prisma.setting.findUnique({ where: { key: "sender_name" } });
  const email = await prisma.setting.findUnique({ where: { key: "sender_email" } });
  return {
    name: name?.value || "Hopi Digital",
    email: email?.value || "pungki@hopidigital.com",
  };
}

export function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.username, pass: config.password },
  });
}

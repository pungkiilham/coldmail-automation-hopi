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
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ["smtp_host", "smtp_port", "smtp_username", "smtp_password", "smtp_use_tls"] },
    },
  });

  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  if (!map.smtp_host || !map.smtp_port || !map.smtp_username || !map.smtp_password) return null;

  return {
    host: map.smtp_host,
    port: parseInt(map.smtp_port),
    username: map.smtp_username,
    password: map.smtp_password,
    useTls: map.smtp_use_tls !== "false",
  };
}

export async function getSenderInfo(): Promise<SenderInfo> {
  const { prisma } = await import("./prisma");
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ["sender_name", "sender_email"] },
    },
  });

  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const fallbackEmail = process.env.FALLBACK_SENDER_EMAIL || "noreply@hopidigital.com";

  return {
    name: map.sender_name || "Hopi Digital",
    email: map.sender_email || fallbackEmail,
  };
}

export function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.useTls && config.port === 465,
    auth: { user: config.username, pass: config.password },
  });
}

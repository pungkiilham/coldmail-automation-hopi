import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const putSchema = z.object({
  smtp_host: z.string().optional(),
  smtp_port: z.string().optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_use_tls: z.string().optional(),
  sender_name: z.string().optional(),
  sender_email: z.string().email().optional(),
});

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  if (map.smtp_password) map.smtp_password = "********";
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const body = putSchema.parse(await req.json());

  if (body.smtp_password === "") {
    delete body.smtp_password;
  }

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  return NextResponse.json({ ok: true });
}

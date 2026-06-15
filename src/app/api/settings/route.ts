import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  for (const key of Object.keys(body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(body[key]) },
      create: { key, value: String(body[key]) },
    });
  }
  return NextResponse.json({ ok: true });
}

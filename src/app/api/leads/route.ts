import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const lead = await prisma.lead.create({
    data: {
      companyName: body.companyName,
      email: body.email,
      industry: body.industry || null,
      region: body.region || null,
    },
  });
  return NextResponse.json(lead, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = parseInt(req.nextUrl.searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.emailLog.deleteMany({ where: { leadId: id } });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

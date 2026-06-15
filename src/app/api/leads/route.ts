import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  region: z.string().optional().default(""),
  website: z.string().optional().default(""),
  contactNote: z.string().optional().default(""),
  whyTarget: z.string().optional().default(""),
});

export async function GET(req: NextRequest) {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "50")));
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.lead.count(),
  ]);

  return NextResponse.json({ data: leads, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = createSchema.parse(await req.json());

  const lead = await prisma.lead.create({
    data: {
      companyName: body.companyName,
      email: body.email,
      firstName: body.firstName || null,
      industry: body.industry || null,
      region: body.region || null,
      website: body.website || null,
      contactNote: body.contactNote || null,
      whyTarget: body.whyTarget || null,
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

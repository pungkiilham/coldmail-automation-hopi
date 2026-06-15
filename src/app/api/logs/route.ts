import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
    include: { lead: { select: { companyName: true } } },
  });
  return NextResponse.json(logs);
}

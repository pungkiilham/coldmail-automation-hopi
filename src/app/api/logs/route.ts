import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "50")));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      orderBy: { sentAt: "desc" },
      skip,
      take: limit,
      include: { lead: { select: { companyName: true } } },
    }),
    prisma.emailLog.count(),
  ]);

  return NextResponse.json({ data: logs, total, page, limit });
}

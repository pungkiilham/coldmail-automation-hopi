import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const text = await req.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });

    if (!row.email) continue;

    await prisma.lead.upsert({
      where: { email: row.email },
      update: {
        companyName: row.companyname || row.company || row["company name"] || "",
        industry: row.industry || null,
        region: row.region || null,
        website: row.website || null,
      },
      create: {
        companyName: row.companyname || row.company || row["company name"] || "",
        email: row.email,
        industry: row.industry || null,
        region: row.region || null,
        website: row.website || null,
      },
    });
    count++;
  }

  return NextResponse.json({ count });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { z } from "zod";

const leadSchema = z.object({
  email: z.string().email(),
  companyname: z.string().optional().default(""),
  company: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  region: z.string().optional().default(""),
  website: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  const text = await req.text();
  let records: Record<string, string>[];

  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch {
    return NextResponse.json({ error: "Invalid CSV format" }, { status: 400 });
  }

  let count = 0;

  for (const raw of records) {
    const row = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k.toLowerCase().replace(/\s+/g, ""), v])
    );

    if (!row.email) continue;

    const companyName = row.companyname || row.company || "";

    try {
      await prisma.lead.upsert({
        where: { email: row.email },
        update: {
          companyName: companyName || "",
          industry: row.industry || null,
          region: row.region || null,
          website: row.website || null,
        },
        create: {
          companyName: companyName || "",
          email: row.email,
          industry: row.industry || null,
          region: row.region || null,
          website: row.website || null,
        },
      });
      count++;
    } catch {
      // skip invalid rows silently
    }
  }

  return NextResponse.json({ count });
}

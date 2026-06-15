import { NextRequest, NextResponse } from "next/server";
import { getSmtpConfig, getSenderInfo, createTransporter } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const testSchema = z.object({
  subject: z.string().min(1),
  bodyText: z.string().min(1),
  bodyHtml: z.string().optional(),
  toEmail: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = testSchema.parse(await req.json());

  const smtpConfig = await getSmtpConfig();
  if (!smtpConfig) {
    return NextResponse.json({ error: "SMTP not configured" }, { status: 400 });
  }

  const sender = await getSenderInfo();
  const transporter = createTransporter(smtpConfig);

  try {
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: body.toEmail,
      subject: `[TEST] ${body.subject}`,
      text: body.bodyText,
      ...(body.bodyHtml ? { html: body.bodyHtml } : {}),
    });

    return NextResponse.json({ ok: true, to: body.toEmail });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

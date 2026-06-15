import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSmtpConfig, getSenderInfo, createTransporter } from "@/lib/email";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  bodyText: z.string().min(1),
  bodyHtml: z.string().optional(),
  delaySec: z.number().int().min(5).default(30),
  maxPerDay: z.number().int().min(1).default(20),
  leadIds: z.array(z.number().int().positive()).min(1),
});

export async function POST(req: NextRequest) {
  const body = createSchema.parse(await req.json());

  const smtpConfig = await getSmtpConfig();
  if (!smtpConfig) {
    return NextResponse.json({ error: "SMTP not configured" }, { status: 400 });
  }

  const sender = await getSenderInfo();
  const transporter = createTransporter(smtpConfig);

  const campaign = await prisma.campaign.create({
    data: {
      name: body.name,
      subject: body.subject,
      bodyText: body.bodyText,
      bodyHtml: body.bodyHtml || null,
      delaySec: body.delaySec,
      maxPerDay: body.maxPerDay,
      status: "running",
    },
  });

  const leads = await prisma.lead.findMany({
    where: { id: { in: body.leadIds } },
  });

  let sent = 0;

  for (const lead of leads) {
    const personalize = (text: string) =>
      text
        .replace(/\{\{companyName\}\}/g, lead.companyName)
        .replace(/\{\{firstName\}\}/g, lead.firstName || lead.companyName);

    const subject = personalize(body.subject);
    const text = personalize(body.bodyText);
    const html = body.bodyHtml ? personalize(body.bodyHtml) : undefined;

    try {
      await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: lead.email,
        subject,
        text,
        ...(html ? { html } : {}),
      });

      await prisma.emailLog.create({
        data: {
          campaignId: campaign.id,
          leadId: lead.id,
          leadEmail: lead.email,
          subject,
          status: "sent",
        },
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "sent" },
      });

      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      await prisma.emailLog.create({
        data: {
          campaignId: campaign.id,
          leadId: lead.id,
          leadEmail: lead.email,
          subject,
          status: "failed",
          error: message,
        },
      });
    }

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { sentCount: sent },
    });

    if (sent >= body.maxPerDay) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "paused" },
      });
      break;
    }
  }

  const finalStatus = sent >= leads.length ? "completed" : "paused";
  if (finalStatus === "completed") {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "completed" },
    });
  }

  return NextResponse.json({
    campaignId: campaign.id,
    status: finalStatus,
    sent,
    total: leads.length,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSmtpConfig, getSenderInfo, createTransporter } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, subject, bodyText, bodyHtml, delaySec, maxPerDay, leadIds } = body;

  const smtpConfig = await getSmtpConfig();
  if (!smtpConfig) {
    return NextResponse.json({ error: "SMTP not configured" }, { status: 400 });
  }

  const sender = await getSenderInfo();
  const transporter = createTransporter(smtpConfig);

  const campaign = await prisma.campaign.create({
    data: { name, subject, bodyText, bodyHtml, delaySec, maxPerDay, status: "running" },
  });

  const leads = await prisma.lead.findMany({
    where: { id: { in: leadIds } },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function emit(msg: string) {
        controller.enqueue(encoder.encode(msg + "\n"));
      }

      emit(`Campaign #${campaign.id} started — ${leads.length} leads`);

      let sent = 0;
      for (const lead of leads) {
        const personalizedSubject = subject
          .replace(/\{\{companyName\}\}/g, lead.companyName)
          .replace(/\{\{firstName\}\}/g, lead.firstName || lead.companyName);

        const personalizedText = bodyText
          .replace(/\{\{companyName\}\}/g, lead.companyName)
          .replace(/\{\{firstName\}\}/g, lead.firstName || lead.companyName);

        let personalizedHtml = bodyHtml;
        if (personalizedHtml) {
          personalizedHtml = personalizedHtml
            .replace(/\{\{companyName\}\}/g, lead.companyName)
            .replace(/\{\{firstName\}\}/g, lead.firstName || lead.companyName);
        }

        try {
          const mailOptions: any = {
            from: `"${sender.name}" <${sender.email}>`,
            to: lead.email,
            subject: personalizedSubject,
            text: personalizedText,
          };
          if (personalizedHtml) mailOptions.html = personalizedHtml;

          await transporter.sendMail(mailOptions);

          await prisma.emailLog.create({
            data: {
              campaignId: campaign.id,
              leadId: lead.id,
              leadEmail: lead.email,
              subject: personalizedSubject,
              status: "sent",
            },
          });

          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: "sent" },
          });

          emit(`[OK] ${lead.companyName} <${lead.email}> — sent`);
          sent++;
        } catch (err: any) {
          await prisma.emailLog.create({
            data: {
              campaignId: campaign.id,
              leadId: lead.id,
              leadEmail: lead.email,
              subject: personalizedSubject,
              status: "failed",
              error: err.message,
            },
          });

          emit(`[FAIL] ${lead.companyName} <${lead.email}> — ${err.message}`);
        }

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { sentCount: sent },
        });

        if (sent >= maxPerDay) {
          emit(`Reached daily limit of ${maxPerDay}. Pausing.`);
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: "paused" },
          });
          break;
        }

        await new Promise((r) => setTimeout(r, delaySec * 1000));
      }

      if (sent < leads.length) {
        emit("Campaign paused — resume later.");
      } else {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "completed" },
        });
        emit("Campaign completed!");
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}

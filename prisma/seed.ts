import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const leads = [
  { companyName: "Thien Thuy Moc", industry: "Furniture / Manufacturing", region: "Vietnam", website: "thienthuymoc.com", email: "", whyTarget: "Already uses Odoo — upgrade or expand modules" },
  { companyName: "Woody Moody Jakarta", industry: "Furniture / MSME", region: "Indonesia", website: "-", email: "", whyTarget: "Studied Odoo implementation — ready to adopt" },
  { companyName: "Alpha ERP (Belgium)", industry: "Odoo Partner / SMEs", region: "Belgium", website: "alpha-erp.be", email: "", whyTarget: "Potential partnership — they serve SMEs in Flanders with Odoo" },
  { companyName: "ERPartists (EU)", industry: "Manufacturing consulting", region: "Europe", website: "erpartists.com", email: "", whyTarget: "Help their manufacturing clients switch to Odoo" },
  { companyName: "Techvaria Solutions", industry: "IT / Odoo Implementation", region: "Global", website: "techvaria.com", email: "", whyTarget: "Competitor — potential partner for overflow work" },
  { companyName: "Slyko Technologies", industry: "Odoo Implementation", region: "India / Hyderabad", website: "slyko.tech", email: "", whyTarget: "Competitor in India — potential collaboration" },
  { companyName: "Novobi", industry: "Odoo Gold Partner", region: "USA", website: "novobi.com", email: "", whyTarget: "Large partner — potential sub-partner for overflow" },
  { companyName: "Ksolves India", industry: "Odoo Gold Partner", region: "India", website: "ksolves.com", email: "", whyTarget: "Publicly traded Odoo partner — large org" },
  { companyName: "Glorium Technologies", industry: "Odoo Implementation", region: "USA/Global", website: "gloriumtech.com", email: "", whyTarget: "Certified Odoo partner — high-end clients" },
  { companyName: "ERP Pilot", industry: "ERP Consulting / Odoo", region: "Europe", website: "erp-pilot.com", email: "", whyTarget: "Connects Odoo partners — list Hopi Digital" },
  { companyName: "Art Metal Solusindo", industry: "Manufacturing / Hobby Products", region: "Indonesia", website: "-", email: "", whyTarget: "Existing client for referral / testimonial" },
  { companyName: "Zolute Consulting", industry: "Odoo Consulting", region: "Europe", website: "zolute.consulting", email: "", whyTarget: "Helps manufacturers ditch legacy ERP" },
  { companyName: "Synconics Canada", industry: "Odoo Consulting", region: "Canada", website: "synconics.ca", email: "", whyTarget: "Expanding Odoo services — may need senior devs" },
  { companyName: "Sedin Technologies", industry: "Odoo / Digital Transformation", region: "Middle East", website: "sedintechnologies.com", email: "", whyTarget: "SME digital transformation in Middle East" },
  { companyName: "DGMX Tech", industry: "SAP & Odoo Implementation", region: "Mexico/US", website: "dgmxtech.com", email: "", whyTarget: "SAP & Odoo partner — potential collaboration" },
  { companyName: "Brainvire Infotech", industry: "Odoo Partner / IT Consulting", region: "USA/Global", website: "brainvire.com", email: "", whyTarget: "Large Odoo partner — overflow work possibilities" },
  { companyName: "Captivea", industry: "Odoo Gold Partner", region: "USA/Global", website: "captivea.com", email: "", whyTarget: "Established Odoo partner — potential sub-contractor" },
  { companyName: "Bista Solutions", industry: "Odoo Gold Partner", region: "USA", website: "bistasolutions.com", email: "", whyTarget: "Award-winning partner — large implementations" },
  { companyName: "OdooExpress", industry: "Odoo Implementation", region: "Global", website: "odooexpress.com", email: "", whyTarget: "Odoo partner — potential collaboration" },
  { companyName: "SerpentCS", industry: "Odoo Implementation", region: "India", website: "serpentcs.com", email: "", whyTarget: "Odoo partner with global reach — potential partner" },
  { companyName: "VNA Infotech", industry: "Odoo Development", region: "India", website: "vnainfotech.framer.ai", email: "", whyTarget: "Odoo developers — potential competition/partner" },
  { companyName: "Techvoot Solutions", industry: "Odoo Partner", region: "Global", website: "techvoot.com", email: "", whyTarget: "Certified Odoo partner — potential overflow work" },
  { companyName: "German Automotive Parts (Bavaria)", industry: "Automotive Manufacturing", region: "Germany", website: "-", email: "", whyTarget: "Case study — actively switching to Odoo" },
  { companyName: "UK Engine Manufacturer", industry: "Engine Manufacturing", region: "UK", website: "-", email: "", whyTarget: "Completed Odoo digital transformation — reference" },
];

async function main() {
  console.log("Seeding leads...");
  for (const lead of leads) {
    const email = lead.email || `lead-${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}@placeholder.com`;
    await prisma.lead.upsert({
      where: { email },
      update: {},
      create: { ...lead, email },
    });
    console.log(`  ✓ ${lead.companyName}`);
  }

  console.log("\nSeeding default settings...");
  const settings = [
    { key: "sender_name", value: "Pungki from Hopi Digital" },
    { key: "sender_email", value: "pungki@hopidigital.com" },
    { key: "smtp_host", value: "smtp.gmail.com" },
    { key: "smtp_port", value: "587" },
    { key: "smtp_use_tls", value: "true" },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
    console.log(`  ✓ ${s.key} = ${s.value}`);
  }

  console.log("\nSeeding sample campaign template...");
  const existing = await prisma.campaign.findFirst({ where: { name: "Odoo Services — Cold Outreach" } });
  if (!existing) {
    await prisma.campaign.create({
      data: {
        name: "Odoo Services — Cold Outreach",
        subject: "Odoo implementation — direct from senior devs",
        bodyText: `Hi {{firstName}},\n\nI see {{companyName}} is [specific context].\n\nWe're Hopi Digital — a team of senior Odoo developers with European consultancy background. We help businesses implement, customize, and scale Odoo at transparent pricing (up to 60% less than European partners).\n\nProof: We built Tapsence (tapsence.com), our own attendance management SaaS on Odoo 19.\n\nInterested in a free 30-min consultation? No obligation — just honest advice.\n\nBest regards,\nPungki Ilham\nHopi Digital\npungki@hopidigital.com\nhopidigital.com`,
        status: "draft",
      },
    });
    console.log("  ✓ Sample campaign created");
  } else {
    console.log("  ✓ Sample campaign already exists");
  }

  console.log("\n✓ Seed complete!");
  console.log("  → Run 'npx next dev' to start the app");
  console.log("  → Fill in email addresses in the Leads page");
  console.log("  → Configure SMTP in Settings page");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-800"
        >
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          <p className="text-lg mb-2">No campaigns yet</p>
          <Link href="/campaigns/new" className="text-indigo-700 hover:underline text-sm">
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{c.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Subject: {c.subject}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-medium ${
                  c.status === "draft" ? "bg-gray-100 text-gray-600" :
                  c.status === "running" ? "bg-blue-100 text-blue-700" :
                  c.status === "completed" ? "bg-green-100 text-green-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{c.status}</span>
              </div>
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>Sent: {c.sentCount}</span>
                <span>Opens: {c.openCount}</span>
                <span>Replies: {c.replyCount}</span>
                <span>Max/day: {c.maxPerDay}</span>
                <span>Delay: {c.delaySec}s</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

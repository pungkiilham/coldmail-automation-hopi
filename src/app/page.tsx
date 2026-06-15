import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalLeads, sentCount, repliedCount, campaignCount] = await Promise.all([
    prisma.lead.count(),
    prisma.emailLog.count({ where: { status: "sent" } }),
    prisma.emailLog.count({ where: { status: "replied" } }),
    prisma.campaign.count(),
  ]);
  return { totalLeads, sentCount, repliedCount, campaignCount };
}

async function getRecentLogs() {
  return prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 10,
    include: { lead: { select: { companyName: true } } },
  });
}

export default async function DashboardPage() {
  const stats = await getStats();
  const logs = await getRecentLogs();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="Emails Sent" value={stats.sentCount} />
        <StatCard label="Replies" value={stats.repliedCount} />
        <StatCard label="Campaigns" value={stats.campaignCount} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-lg mb-3">Recent Activity</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No emails sent yet. Create a campaign to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">To</th>
                <th className="pb-2">Subject</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100">
                  <td className="py-2">{log.lead?.companyName || log.leadEmail}</td>
                  <td className="py-2 max-w-xs truncate">{log.subject}</td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      log.status === "sent" ? "bg-green-100 text-green-700" :
                      log.status === "failed" ? "bg-red-100 text-red-700" :
                      log.status === "replied" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{log.status}</span>
                  </td>
                  <td className="py-2 text-gray-500">{new Date(log.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

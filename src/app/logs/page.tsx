"use client";

import { useEffect, useState } from "react";

interface Log {
  id: number;
  leadEmail: string;
  subject: string;
  status: string;
  error: string | null;
  sentAt: string;
  lead: { companyName: string } | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data) => { setLogs(data); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Email Logs</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="p-4 text-gray-500">No logs yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{log.lead?.companyName || log.leadEmail}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{log.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      log.status === "sent" ? "bg-green-100 text-green-700" :
                      log.status === "failed" ? "bg-red-100 text-red-700" :
                      log.status === "replied" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-3 text-red-500 max-w-xs truncate">{log.error || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(log.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

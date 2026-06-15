"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Lead {
  id: number;
  companyName: string;
  email: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    bodyText: "",
    bodyHtml: "",
    delaySec: 30,
    maxPerDay: 20,
  });
  const [sending, setSending] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<{ campaignId: number; status: string; sent: number; total: number; sandbox?: boolean; testRecipient?: string } | null>(null);
  const [settings, setSettings] = useState<{ test_recipient: string; sandbox_mode: string }>({ test_recipient: "", sandbox_mode: "false" });

  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then((json) => {
      setLeads(Array.isArray(json) ? json : json.data);
    });
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      setSettings({ test_recipient: data.test_recipient || "", sandbox_mode: data.sandbox_mode || "false" });
    });
  }, []);

  function toggleLead(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  }

  async function startCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert("Select at least one lead.");
      return;
    }
    setSending(true);
    setLog([]);
    setResult(null);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, leadIds: selectedIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLog([data.error || "Failed to start campaign"]);
        return;
      }

      setResult(data);
      const lines = [
        `Campaign #${data.campaignId} — ${data.status}`,
        `Sent: ${data.sent} / ${data.total}`,
      ];
      if (data.sandbox) {
        lines.push(`Sandbox mode: all emails redirected to ${data.testRecipient}`);
      }
      setLog(lines);
    } catch {
      setLog(["Connection error"]);
    } finally {
      setSending(false);
    }
  }

  async function sendTest() {
    if (!form.subject || !form.bodyText) {
      alert("Fill in subject and body text first.");
      return;
    }
    if (!settings.test_recipient) {
      alert("Set a Test Recipient Email in Settings first.");
      return;
    }

    setTestSending(true);
    setLog([]);
    setResult(null);

    try {
      const res = await fetch("/api/campaigns/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          bodyText: form.bodyText,
          bodyHtml: form.bodyHtml,
          toEmail: settings.test_recipient,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLog([`Test failed: ${data.error || "Unknown error"}`]);
        return;
      }

      setLog([`Test email sent to ${data.to} — check your inbox.`]);
    } catch {
      setLog(["Connection error"]);
    } finally {
      setTestSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Campaign</h1>

      {settings.sandbox_mode === "true" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
          Sandbox mode is ON — emails will go to{" "}
          <strong>{settings.test_recipient || "— not set —"}</strong> instead of real leads.
        </div>
      )}

      <form onSubmit={startCampaign} className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-3">
          <input
            placeholder="Campaign Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <input
            placeholder="Email Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <textarea
            placeholder="Plain text body (use {{companyName}} and {{firstName}} for personalization)"
            value={form.bodyText}
            onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
            rows={6}
            required
            className="border rounded-lg px-3 py-2 text-sm w-full font-mono"
          />
          <textarea
            placeholder="HTML body (optional, same variables supported)"
            value={form.bodyHtml}
            onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
            rows={6}
            className="border rounded-lg px-3 py-2 text-sm w-full font-mono"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Delay (seconds)
              <input
                type="number"
                value={form.delaySec}
                onChange={(e) => setForm({ ...form, delaySec: parseInt(e.target.value) })}
                min={5}
                className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
              />
            </label>
            <label className="text-sm">
              Max emails/day
              <input
                type="number"
                value={form.maxPerDay}
                onChange={(e) => setForm({ ...form, maxPerDay: parseInt(e.target.value) })}
                min={1}
                className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Select Leads ({selectedIds.length}/{leads.length})</h2>
            <button type="button" onClick={toggleAll} className="text-sm text-indigo-700 hover:underline">
              {selectedIds.length === leads.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-gray-500">No leads yet. Add some first.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {leads.map((lead) => (
                <label key={lead.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(lead.id)}
                    onChange={() => toggleLead(lead.id)}
                  />
                  {lead.companyName} — {lead.email}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sending}
            className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-800 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Start Campaign"}
          </button>

          <button
            type="button"
            disabled={testSending}
            onClick={sendTest}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            {testSending ? "Sending..." : "Send Test"}
          </button>
        </div>
      </form>

      {result && (
        <div className={`rounded-xl p-4 text-sm font-medium ${
          result.status === "completed" ? "bg-green-50 text-green-700 border border-green-200" :
          result.status === "paused" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
          "bg-blue-50 text-blue-700 border border-blue-200"
        }`}>
          Campaign {result.status === "completed" ? "completed" : "paused"} —
          {result.sent} of {result.total} emails sent.
          {result.sandbox && <div className="mt-1 text-yellow-700">Sandbox: redirected to {result.testRecipient}</div>}
        </div>
      )}

      {log.length > 0 && (
        <div className="bg-black text-green-400 rounded-xl p-4 text-xs font-mono max-h-80 overflow-y-auto">
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
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

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, leadIds: selectedIds }),
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n").filter(Boolean);
      setLog((prev) => [...prev, ...lines]);
    }
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Campaign</h1>

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

        <button
          type="submit"
          disabled={sending}
          className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-800 disabled:opacity-50"
        >
          {sending ? "Sending..." : "Start Campaign"}
        </button>
      </form>

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

"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: number;
  companyName: string;
  email: string;
  industry: string | null;
  region: string | null;
  status: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: "", email: "", industry: "", region: "" });
  const [csvResult, setCsvResult] = useState("");

  async function loadLeads() {
    setLoading(true);
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  }

  useEffect(() => { loadLeads(); }, []);

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ companyName: "", email: "", industry: "", region: "" });
    setShowForm(false);
    loadLeads();
  }

  async function handleCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: text,
    });
    const data = await res.json();
    setCsvResult(`Imported ${data.count} leads.`);
    loadLeads();
  }

  async function deleteLead(id: number) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    loadLeads();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-800">
          + Add Lead
        </button>
      </div>

      {showForm && (
        <form onSubmit={addLead} className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <label className="text-sm font-medium">Import CSV</label>
        <input type="file" accept=".csv" onChange={handleCsv} className="block mt-1 text-sm" />
        {csvResult && <p className="text-green-600 text-sm mt-1">{csvResult}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : leads.length === 0 ? (
          <p className="p-4 text-gray-500">No leads yet. Add one manually or import a CSV.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{lead.companyName}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.industry || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.region || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      lead.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      lead.status === "sent" ? "bg-green-100 text-green-700" :
                      lead.status === "replied" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{lead.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteLead(lead.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

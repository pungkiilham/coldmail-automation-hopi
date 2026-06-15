"use client";

import { useEffect, useState } from "react";

interface Settings {
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_use_tls: string;
  sender_name: string;
  sender_email: string;
}

const KEYS: (keyof Settings)[] = [
  "smtp_host", "smtp_port", "smtp_username", "smtp_password",
  "smtp_use_tls", "sender_name", "sender_email",
];

const LABELS: Record<string, string> = {
  smtp_host: "SMTP Host",
  smtp_port: "SMTP Port",
  smtp_username: "SMTP Username",
  smtp_password: "SMTP Password",
  smtp_use_tls: "Use TLS (true/false)",
  sender_name: "Sender Name",
  sender_email: "Sender Email",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    smtp_host: "", smtp_port: "587", smtp_username: "",
    smtp_password: "", smtp_use_tls: "true",
    sender_name: "Hopi Digital", sender_email: "pungki@hopidigital.com",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      for (const k of KEYS) {
        if (data[k]) setSettings((s) => ({ ...s, [k]: data[k] }));
      }
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">SMTP Settings</h1>
      <form onSubmit={save} className="bg-white rounded-xl shadow-sm border p-5 space-y-3 max-w-lg">
        {KEYS.map((key) => (
          <label key={key} className="text-sm block">
            {LABELS[key]}
            {key === "smtp_password" ? (
              <input
                type="password"
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
              />
            ) : (
              <input
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
              />
            )}
          </label>
        ))}
        <button
          type="submit"
          className="bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-800"
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          SMTP credentials are stored in the local SQLite database. Use a Gmail App Password for Gmail.
        </p>
      </form>
    </div>
  );
}

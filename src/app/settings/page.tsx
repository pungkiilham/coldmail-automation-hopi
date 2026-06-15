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
  test_recipient: string;
  sandbox_mode: string;
}

const KEYS: (keyof Settings)[] = [
  "smtp_host", "smtp_port", "smtp_username", "smtp_password",
  "smtp_use_tls", "sender_name", "sender_email",
  "test_recipient", "sandbox_mode",
] as const;

const LABELS: Record<string, string> = {
  smtp_host: "SMTP Host",
  smtp_port: "SMTP Port",
  smtp_username: "SMTP Username",
  smtp_password: "SMTP Password",
  smtp_use_tls: "Use TLS (true/false)",
  sender_name: "Sender Name",
  sender_email: "Sender Email",
  test_recipient: "Test Recipient Email",
  sandbox_mode: "Sandbox Mode (true/false)",
};

const SECTIONS: { title: string; keys: (keyof Settings)[] }[] = [
  { title: "SMTP Configuration", keys: ["smtp_host", "smtp_port", "smtp_username", "smtp_password", "smtp_use_tls"] },
  { title: "Sender Info", keys: ["sender_name", "sender_email"] },
  { title: "Sandbox / Test Mode", keys: ["test_recipient", "sandbox_mode"] },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    smtp_host: "", smtp_port: "587", smtp_username: "",
    smtp_password: "", smtp_use_tls: "true",
    sender_name: "Hopi Digital", sender_email: "pungki@hopidigital.com",
    test_recipient: "", sandbox_mode: "false",
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
      <h1 className="text-2xl font-bold">Settings</h1>

      {settings.sandbox_mode === "true" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
          Sandbox mode is ON — all campaign emails will be sent to{" "}
          <strong>{settings.test_recipient || "— not set —"}</strong> instead of real leads.
        </div>
      )}

      <form onSubmit={save} className="space-y-6">
        {SECTIONS.map((section) => (
          <fieldset key={section.title} className="bg-white rounded-xl shadow-sm border p-5 space-y-3">
            <legend className="font-semibold text-base px-1">{section.title}</legend>
            {section.keys.map((key) => (
              <label key={key} className="text-sm block">
                {LABELS[key]}
                {key === "smtp_password" ? (
                  <input
                    type="password"
                    value={settings[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
                  />
                ) : key === "sandbox_mode" ? (
                  <select
                    value={settings[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
                  >
                    <option value="false">Off</option>
                    <option value="true">On</option>
                  </select>
                ) : (
                  <input
                    value={settings[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
                  />
                )}
              </label>
            ))}
          </fieldset>
        ))}

        <button
          type="submit"
          className="bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-800"
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

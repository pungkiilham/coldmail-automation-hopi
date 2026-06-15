"use client";

import { useEffect, useState } from "react";

interface SandboxInfo {
  sandbox_mode: string;
  test_recipient: string;
}

export default function SandboxBanner() {
  const [info, setInfo] = useState<SandboxInfo | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setInfo(data))
      .catch(() => {});
  }, []);

  if (!info || info.sandbox_mode !== "true") return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-sm text-yellow-800 text-center">
      Sandbox mode — all campaigns will send to{" "}
      <strong>{info.test_recipient || "— not set —"}</strong>
    </div>
  );
}

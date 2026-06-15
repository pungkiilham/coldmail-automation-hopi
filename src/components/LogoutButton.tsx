"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button onClick={handleLogout} className="hover:text-indigo-300 transition ml-auto text-sm cursor-pointer">
      Logout
    </button>
  );
}

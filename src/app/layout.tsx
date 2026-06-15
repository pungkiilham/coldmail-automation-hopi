import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hopi Digital — Cold Mail App",
  description: "Cold email automation for Hopi Digital",
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/logs", label: "Logs" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <nav className="bg-indigo-900 text-white px-6 py-3 flex items-center gap-6 text-sm font-medium shadow-md">
          <Link href="/" className="text-lg font-bold tracking-tight mr-4">✉️ Hopi Mail</Link>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-indigo-300 transition">{n.label}</Link>
          ))}
          <LogoutButton />
        </nav>
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}

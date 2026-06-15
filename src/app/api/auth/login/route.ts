import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (!adminUser || !adminPass || !authSecret) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = crypto.createHash("sha256").update(authSecret).digest("hex");

  const response = NextResponse.json({ ok: true });
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

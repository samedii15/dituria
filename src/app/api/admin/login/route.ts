import { NextResponse } from "next/server";

import { ADMIN_SESSION_KEY, getAdminCredentials } from "@/lib/auth";
import { badRequest } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Invalid body");
  }

  const { username, password } = getAdminCredentials();
  const isValid = body.username === username && body.password === password;

  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_KEY, process.env.ADMIN_SESSION_TOKEN || "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}

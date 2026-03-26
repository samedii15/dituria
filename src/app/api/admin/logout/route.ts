import { NextResponse } from "next/server";

import { ADMIN_SESSION_KEY } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_SESSION_KEY);
  return response;
}

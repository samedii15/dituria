import { cookies } from "next/headers";

const SESSION_KEY = "admin_session";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_KEY)?.value;
  return token === process.env.ADMIN_SESSION_TOKEN;
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

export const ADMIN_SESSION_KEY = SESSION_KEY;

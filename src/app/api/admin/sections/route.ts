import { NextResponse } from "next/server";

import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { canAttemptDatabase, clearDatabaseUnavailable, markDatabaseUnavailable, shouldSkipDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { sectionInputSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return NextResponse.json({ sections: [], databaseAvailable: false });
  }

  try {
    const sections = await prisma.section.findMany({
      orderBy: { createdAt: "desc" },
    });
    clearDatabaseUnavailable();
    return NextResponse.json({ sections, databaseAvailable: true });
  } catch {
    markDatabaseUnavailable();
    return NextResponse.json({ sections: [], databaseAvailable: false });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = sectionInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const section = await prisma.section.create({ data: parsed.data });
  return NextResponse.json({ section });
}

import { NextResponse } from "next/server";

import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { canAttemptDatabase, clearDatabaseUnavailable, markDatabaseUnavailable, shouldSkipDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { chapterInputSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return NextResponse.json({ chapters: [], databaseAvailable: false });
  }

  try {
    const chapters = await prisma.hadithChapter.findMany({
      include: { book: true },
      orderBy: [{ bookId: "asc" }, { order: "asc" }],
    });
    clearDatabaseUnavailable();
    return NextResponse.json({ chapters, databaseAvailable: true });
  } catch {
    markDatabaseUnavailable();
    return NextResponse.json({ chapters: [], databaseAvailable: false });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = chapterInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const chapter = await prisma.hadithChapter.create({ data: parsed.data });
  return NextResponse.json({ chapter });
}

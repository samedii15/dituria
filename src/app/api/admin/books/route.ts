import { NextResponse } from "next/server";

import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { canAttemptDatabase, clearDatabaseUnavailable, markDatabaseUnavailable, shouldSkipDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { bookInputSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return NextResponse.json({ books: [], databaseAvailable: false });
  }

  try {
    const books = await prisma.hadithBook.findMany({
      include: { chapters: true },
      orderBy: { createdAt: "desc" },
    });
    clearDatabaseUnavailable();
    return NextResponse.json({ books, databaseAvailable: true });
  } catch {
    markDatabaseUnavailable();
    return NextResponse.json({ books: [], databaseAvailable: false });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = bookInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const book = await prisma.hadithBook.create({ data: parsed.data });
  return NextResponse.json({ book });
}

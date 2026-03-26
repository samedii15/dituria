import { NextResponse } from "next/server";

import { unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { canAttemptDatabase, clearDatabaseUnavailable, markDatabaseUnavailable, shouldSkipDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return NextResponse.json({ sections: [], categories: [], books: [], chapters: [], sectionBooks: [], databaseAvailable: false });
  }

  try {
    const [sections, categories, books, chapters] = await Promise.all([
      prisma.section.findMany({ orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.hadithBook.findMany({ orderBy: { title: "asc" } }),
      prisma.hadithChapter.findMany({ orderBy: [{ bookId: "asc" }, { order: "asc" }] }),
    ]);

    clearDatabaseUnavailable();
    return NextResponse.json({ sections, categories, books, chapters, sectionBooks: [], databaseAvailable: true });
  } catch {
    markDatabaseUnavailable();
    return NextResponse.json({ sections: [], categories: [], books: [], chapters: [], sectionBooks: [], databaseAvailable: false });
  }
}

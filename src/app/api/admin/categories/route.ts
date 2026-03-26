import { NextResponse } from "next/server";

import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { canAttemptDatabase, clearDatabaseUnavailable, markDatabaseUnavailable, shouldSkipDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return NextResponse.json({ categories: [], databaseAvailable: false });
  }

  try {
    const categories = await prisma.category.findMany({
      include: { section: true },
      orderBy: { createdAt: "desc" },
    });
    clearDatabaseUnavailable();
    return NextResponse.json({ categories, databaseAvailable: true });
  } catch {
    markDatabaseUnavailable();
    return NextResponse.json({ categories: [], databaseAvailable: false });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const category = await prisma.category.create({ data: parsed.data });

  return NextResponse.json({ category });
}

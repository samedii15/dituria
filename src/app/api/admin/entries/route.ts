import { NextResponse } from "next/server";

import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectEntryDuplicates } from "@/lib/search";
import { entryInputSchema, parseTags, type EntryInput } from "@/lib/validation";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("sectionId") || undefined;
  const bookId = searchParams.get("bookId") || undefined;

  const entries = await prisma.entry.findMany({
    where: {
      sectionId,
      bookId,
    },
    include: {
      section: true,
      category: true,
      book: true,
      chapter: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Invalid body");
  }

  const parsed = entryInputSchema.safeParse({
    ...body,
    tags: parseTags(body.tags),
  });

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const data: EntryInput = parsed.data;

  const duplicates = await detectEntryDuplicates({
    title: data.title,
    content: data.content,
    hadithNumber: data.hadithNumber,
    bookId: data.bookId,
  });

  if (duplicates.length > 0 && !data.forceSave) {
    return NextResponse.json(
      {
        error: "Kjo permbajtje ekziston tashme",
        duplicates,
      },
      { status: 409 },
    );
  }

  const entry = await prisma.entry.create({
    data: {
      sectionId: data.sectionId,
      categoryId: data.categoryId || null,
      bookId: data.bookId || null,
      chapterId: data.chapterId || null,
      title: data.title,
      content: data.content,
      arabicText: data.arabicText || null,
      hadithNumber: data.hadithNumber || null,
      source: data.source || null,
      tags: data.tags,
      isPublished: data.isPublished,
    },
    include: {
      section: true,
      category: true,
      book: true,
      chapter: true,
    },
  });

  return NextResponse.json({ entry });
}

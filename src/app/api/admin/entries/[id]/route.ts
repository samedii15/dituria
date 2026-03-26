import { NextResponse } from "next/server";

import { badRequest, notFound, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectEntryDuplicates } from "@/lib/search";
import { entryInputSchema, parseTags, type EntryInput } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      section: true,
      category: true,
      book: true,
      chapter: true,
      revisions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!entry) {
    return notFound("Entry not found");
  }

  return NextResponse.json({ entry });
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
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

  const current = await prisma.entry.findUnique({ where: { id } });

  if (!current) {
    return notFound("Entry not found");
  }

  const data: EntryInput = parsed.data;
  const duplicates = await detectEntryDuplicates({
    title: data.title,
    content: data.content,
    hadithNumber: data.hadithNumber,
    bookId: data.bookId,
    ignoreEntryId: id,
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

  await prisma.entryRevision.create({
    data: {
      entryId: current.id,
      title: current.title,
      content: current.content,
      arabicText: current.arabicText,
      source: current.source,
      tags: current.tags,
    },
  });

  const entry = await prisma.entry.update({
    where: { id },
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

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;

  const current = await prisma.entry.findUnique({ where: { id } });

  if (!current) {
    return notFound("Entry not found");
  }

  await prisma.entry.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

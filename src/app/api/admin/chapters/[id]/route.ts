import { NextResponse } from "next/server";

import { badRequest, notFound, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chapterInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
  const existing = await prisma.hadithChapter.findUnique({ where: { id } });

  if (!existing) {
    return notFound("Chapter not found");
  }

  const body = await request.json().catch(() => null);
  const parsed = chapterInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const chapter = await prisma.hadithChapter.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ chapter });
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
  const existing = await prisma.hadithChapter.findUnique({ where: { id } });

  if (!existing) {
    return notFound("Chapter not found");
  }

  await prisma.hadithChapter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

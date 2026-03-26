import { NextResponse } from "next/server";

import { badRequest, notFound, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
  const existing = await prisma.hadithBook.findUnique({ where: { id } });

  if (!existing) {
    return notFound("Book not found");
  }

  const body = await request.json().catch(() => null);
  const parsed = bookInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const book = await prisma.hadithBook.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ book });
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
  const existing = await prisma.hadithBook.findUnique({ where: { id } });

  if (!existing) {
    return notFound("Book not found");
  }

  await prisma.hadithBook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

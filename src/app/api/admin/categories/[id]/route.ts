import { NextResponse } from "next/server";

import { badRequest, notFound, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    return notFound("Category not found");
  }

  const body = await request.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const category = await prisma.category.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ category });
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    return notFound("Category not found");
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

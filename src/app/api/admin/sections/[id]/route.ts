import { NextResponse } from "next/server";

import { badRequest, notFound, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sectionInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;
  const existing = await prisma.section.findUnique({ where: { id } });

  if (!existing) {
    return notFound("Section not found");
  }

  const body = await request.json().catch(() => null);
  const parsed = sectionInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const section = await prisma.section.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ section });
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const { id } = await params;

  const existing = await prisma.section.findUnique({ where: { id } });
  if (!existing) {
    return notFound("Section not found");
  }

  await prisma.section.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ayahInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid body");
  
  const parsed = ayahInputSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  
  const ayah = await prisma.ayah.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ayah });
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  await prisma.ayah.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


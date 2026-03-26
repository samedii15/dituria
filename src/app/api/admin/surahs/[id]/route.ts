import { NextResponse } from "next/server";
import { badRequest, notFound, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { surahInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  const surah = await prisma.surah.findUnique({ where: { id }, include: { ayahs: { orderBy: { number: "asc" } } } });
  if (!surah) return notFound("Surah not found");
  return NextResponse.json({ surah });
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid body");
  const parsed = surahInputSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  
  const surah = await prisma.surah.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ surah });
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  await prisma.surah.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


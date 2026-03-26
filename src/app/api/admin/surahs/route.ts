import { NextResponse } from "next/server";
import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { surahInputSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const surahs = await prisma.surah.findMany({ orderBy: { number: "asc" } });
  return NextResponse.json({ surahs });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  const parsed = surahInputSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  const surah = await prisma.surah.create({ data: parsed.data });
  return NextResponse.json({ surah }, { status: 201 });
}


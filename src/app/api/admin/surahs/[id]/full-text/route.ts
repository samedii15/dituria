import { NextResponse } from "next/server";

import { badRequest, notFound, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAyahsFromFullSurah } from "@/lib/quran";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;

  const surah = await prisma.surah.findUnique({
    where: { id },
    include: { ayahs: { orderBy: { number: "asc" } } },
  });

  if (!surah) return notFound("Surah not found");

  return NextResponse.json({
    surahId: surah.id,
    ayahCount: surah.ayahs.length,
    arabicText: surah.ayahs.map((ayah) => ayah.arabicText || "").join("\n"),
    albanianText: surah.ayahs.map((ayah) => ayah.text).join("\n"),
  });
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  const arabicText = String(body.arabicText || "");
  const albanianText = String(body.albanianText || "");

  let ayahs;
  try {
    ayahs = buildAyahsFromFullSurah(arabicText, albanianText);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return badRequest(message);
  }

  const surah = await prisma.surah.findUnique({ where: { id } });
  if (!surah) return notFound("Surah not found");

  const result = await prisma.$transaction(async (tx) => {
    await tx.ayah.deleteMany({ where: { surahId: id } });
    const created = await tx.ayah.createMany({
      data: ayahs.map((ayah) => ({
        surahId: id,
        number: ayah.number,
        arabicText: ayah.arabicText,
        text: ayah.text,
      })),
    });

    return created.count;
  });

  return NextResponse.json({ ok: true, count: result });
}
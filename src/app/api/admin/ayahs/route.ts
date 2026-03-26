import { NextResponse } from "next/server";
import { badRequest, unauthorized } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ayahInputSchema } from "@/lib/validation";
import { z } from "zod";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  // Support bulk insert
  if (Array.isArray(body)) {
    const parsed = z.array(ayahInputSchema).safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
    // Create many is best wrapped in transaction but createMany works if sqlite/postgres
    const result = await prisma.ayah.createMany({ data: parsed.data, skipDuplicates: true });
    return NextResponse.json({ count: result.count }, { status: 201 });
  } else {
    const parsed = ayahInputSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const ayah = await prisma.ayah.create({ data: parsed.data });
    return NextResponse.json({ ayah }, { status: 201 });
  }
}


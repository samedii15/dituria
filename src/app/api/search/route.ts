import { NextResponse } from "next/server";

import { searchEntries } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const section = searchParams.get("section") || undefined;
  const book = searchParams.get("book") || undefined;
  const limit = Number(searchParams.get("limit") || "12");

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchEntries({
    query,
    sectionSlug: section,
    bookSlug: book,
    limit,
  });

  return NextResponse.json({ results });
}

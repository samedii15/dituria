import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { searchEntries, searchQuran } from "@/lib/search";

type LiveSearchResult = {
  id: string;
  title: string;
  section: { name: string; slug: string };
  book: { title: string; slug: string } | null;
  href: string;
  subtitle?: string;
};

function hasQuranIntent(query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return normalized.includes("quran") || normalized.includes("kuran");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const section = searchParams.get("section") || undefined;
  const book = searchParams.get("book") || undefined;
  const mode = searchParams.get("mode") || "";
  const limit = Number(searchParams.get("limit") || "12");
  const safeLimit = Math.min(Math.max(limit, 1), 40);

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const quranIntent = hasQuranIntent(query);
  const shouldIncludeQuran = !book && (!section || section === "kuran" || section === "quran");

  if (mode === "typeahead") {
    const entryMatches = await prisma.entry.findMany({
      where: {
        isPublished: true,
        AND: [
          section
            ? {
                section: {
                  slug: section,
                },
              }
            : {},
          book
            ? {
                book: {
                  slug: book,
                },
              }
            : {},
          {
            OR: [
              { title: { startsWith: query, mode: "insensitive" } },
              { hadithNumber: { startsWith: query, mode: "insensitive" } },
              { source: { startsWith: query, mode: "insensitive" } },
              { section: { name: { startsWith: query, mode: "insensitive" } } },
              { category: { name: { startsWith: query, mode: "insensitive" } } },
              { book: { title: { startsWith: query, mode: "insensitive" } } },
              { chapter: { title: { startsWith: query, mode: "insensitive" } } },
            ],
          },
        ],
      },
      include: {
        section: true,
        book: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: safeLimit,
    });

    const typedEntryResults: LiveSearchResult[] = entryMatches.map((item) => ({
      id: item.id,
      title: item.title,
      section: {
        name: item.section?.name || "Pa seksion",
        slug: item.section?.slug || "",
      },
      book: item.book
        ? {
            title: item.book.title,
            slug: item.book.slug,
          }
        : null,
      href: `/entries/${item.id}`,
    }));

    const quranTypeaheadResults = shouldIncludeQuran
      ? await searchQuran({
          query,
          limit: Math.min(6, safeLimit),
          mode: "typeahead",
        })
      : [];

    const normalizedQuranResults: LiveSearchResult[] = quranTypeaheadResults.map((item) => ({
      id: item.id,
      title: `Sure ${item.surahNumber}: ${item.surahName}`,
      section: { name: "Kuran", slug: "kuran" },
      book: null,
      href: `/sections/kuran?q=${encodeURIComponent(query)}`,
      subtitle: item.matchedAyahNumber && item.matchedAyahText ? `Ajeti ${item.matchedAyahNumber}: ${item.matchedAyahText}` : undefined,
    }));

    const dedupedQuran = normalizedQuranResults.filter(
      (result, index, all) => all.findIndex((item) => item.id === result.id) === index,
    );

    const combinedTypeahead = [...typedEntryResults, ...dedupedQuran].slice(0, safeLimit);

    if (combinedTypeahead.length === 0 && quranIntent) {
      combinedTypeahead.push({
        id: "quran-shortcut",
        title: "Hape seksionin e Kuranit",
        section: { name: "Kuran", slug: "kuran" },
        book: null,
        href: `/sections/kuran?q=${encodeURIComponent(query)}`,
      });
    }

    return NextResponse.json({ results: combinedTypeahead });
  }

  const entryResults = await searchEntries({
    query,
    sectionSlug: section,
    bookSlug: book,
    limit: safeLimit,
  });

  const quranResults = shouldIncludeQuran
    ? await searchQuran({
        query,
        limit: safeLimit,
        mode: "full",
      })
    : [];

  const normalizedQuranResults: LiveSearchResult[] = quranResults.map((item) => ({
    id: item.id,
    title: `Sure ${item.surahNumber}: ${item.surahName}`,
    section: { name: "Kuran", slug: "kuran" },
    book: null,
    href: `/sections/kuran?q=${encodeURIComponent(query)}`,
    subtitle: item.matchedAyahNumber && item.matchedAyahText ? `Ajeti ${item.matchedAyahNumber}: ${item.matchedAyahText}` : undefined,
  }));

  const normalizedEntries: LiveSearchResult[] = entryResults.map((item) => ({
    id: item.id,
    title: item.title,
    section: {
      name: item.section?.name || "Pa seksion",
      slug: item.section?.slug || "",
    },
    book: item.book
      ? {
          title: item.book.title,
          slug: item.book.slug,
        }
      : null,
    href: `/entries/${item.id}`,
  }));

  const dedupedQuran = normalizedQuranResults.filter((result, index, all) => all.findIndex((item) => item.id === result.id) === index);
  const combined = [...normalizedEntries, ...dedupedQuran].slice(0, safeLimit);

  if (combined.length === 0 && quranIntent) {
    combined.push({
      id: "quran-shortcut",
      title: "Hape seksionin e Kuranit",
      section: { name: "Kuran", slug: "kuran" },
      book: null,
      href: `/sections/kuran?q=${encodeURIComponent(query)}`,
    });
  }

  return NextResponse.json({ results: combined });
}

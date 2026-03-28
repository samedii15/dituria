import { prisma } from "@/lib/prisma";
import {
  canAttemptDatabase,
  clearDatabaseUnavailable,
  isDatabaseUnavailableError,
  markDatabaseUnavailable,
  shouldSkipDatabase,
} from "@/lib/db-health";

type SearchOptions = {
  query: string;
  sectionSlug?: string;
  bookSlug?: string;
  limit?: number;
};

type QuranSearchMode = "typeahead" | "full";

export type QuranSearchResult = {
  id: string;
  surahId: string;
  surahNumber: number;
  surahName: string;
  matchedAyahNumber: number | null;
  matchedAyahText: string | null;
};

function normalizeLooseText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeLooseText(value: string) {
  return normalizeLooseText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function buildQuranVariants(query: string) {
  const trimmed = query.trim();
  const lowered = trimmed.toLocaleLowerCase();
  const normalized = normalizeLooseText(trimmed);
  const normalizedTokens = tokenizeLooseText(trimmed);

  const variants = new Set<string>([
    trimmed,
    trimmed.replace(/\s+/g, "-"),
    trimmed.replace(/-/g, " "),
    normalized,
    ...normalizedTokens,
  ]);

  // Common transliteration variants used in this Albanian Quran dataset.
  if (lowered.includes("allahu") || lowered.includes("allah") || lowered.includes("all-llah")) {
    variants.add("allah");
    variants.add("allahu");
    variants.add("all-llah");
    variants.add("all-llahu");
    variants.add("all-llahut");
  }

  return Array.from(variants).map((value) => value.trim()).filter(Boolean);
}

function clipText(value: string, max = 110) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 1)}…`;
}

export async function searchEntries(options: SearchOptions) {
  const term = options.query.trim();
  const tokenTerms = tokenizeLooseText(term);

  if (!term) {
    return [];
  }

  const limit = Math.min(Math.max(options.limit || 12, 1), 114);

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return [];
  }

  try {
    const results = await prisma.entry.findMany({
      where: {
        AND: [
          options.sectionSlug
            ? {
                section: {
                  slug: options.sectionSlug,
                },
              }
            : {},
          options.bookSlug
            ? {
                book: {
                  slug: options.bookSlug,
                },
              }
            : {},
          {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { content: { contains: term, mode: "insensitive" } },
              { tags: { hasSome: tokenTerms } },
              { source: { contains: term, mode: "insensitive" } },
              { hadithNumber: { contains: term, mode: "insensitive" } },
              { section: { name: { contains: term, mode: "insensitive" } } },
              { category: { name: { contains: term, mode: "insensitive" } } },
              ...(tokenTerms.length > 1
                ? [
                    {
                      AND: tokenTerms.map((token) => ({
                        OR: [
                          { title: { contains: token, mode: "insensitive" as const } },
                          { content: { contains: token, mode: "insensitive" as const } },
                          { source: { contains: token, mode: "insensitive" as const } },
                          { section: { name: { contains: token, mode: "insensitive" as const } } },
                          { category: { name: { contains: token, mode: "insensitive" as const } } },
                          { book: { title: { contains: token, mode: "insensitive" as const } } },
                          { chapter: { title: { contains: token, mode: "insensitive" as const } } },
                        ],
                      })),
                    },
                  ]
                : []),
            ],
          },
        ],
      },
      include: {
        section: true,
        category: true,
        book: true,
        chapter: true,
      },
      orderBy: [{ isPublished: "desc" }, { updatedAt: "desc" }],
      take: limit,
    });
    clearDatabaseUnavailable();
    return results;
  } catch {
    markDatabaseUnavailable();
    return [];
  }
}

export async function searchQuran(options: { query: string; limit?: number; mode?: QuranSearchMode }) {
  const term = options.query.trim();

  if (!term) {
    return [] as QuranSearchResult[];
  }

  const mode = options.mode || "full";
  const limit = Math.min(Math.max(options.limit || 12, 1), 114);
  const variants = buildQuranVariants(term);
  const termTokens = tokenizeLooseText(term);
  const normalizedTerm = normalizeLooseText(term);
  const ayahVariantWhere = variants.flatMap((value) => ([
    {
      text: {
        contains: value,
        mode: "insensitive" as const,
      },
    },
    {
      arabicText: {
        contains: value,
        mode: "insensitive" as const,
      },
    },
  ]));

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return [] as QuranSearchResult[];
  }

  try {
    const surahs = await prisma.surah.findMany({
      where: {
        OR: [
          ...variants.map((value) => ({
            name: {
              ...(mode === "typeahead" ? { startsWith: value } : { contains: value }),
              mode: "insensitive" as const,
            },
          })),
          {
            ayahs: {
              some: {
                OR: ayahVariantWhere,
              },
            },
          },
        ],
      },
      include: {
        ayahs: {
          where: {
            OR: ayahVariantWhere,
          },
          orderBy: {
            number: "asc",
          },
          take: 5,
        },
      },
      orderBy: {
        number: "asc",
      },
      take: Math.min(limit * 3, 114),
    });

    const ranked = surahs
      .map((surah) => {
        const normalizedName = normalizeLooseText(surah.name);
        const startsWithName = variants.some((variant) => normalizedName.startsWith(normalizeLooseText(variant)));
        const includesName = variants.some((variant) => normalizedName.includes(normalizeLooseText(variant)));

        let bestAyah = surah.ayahs[0];
        let bestCoverage = -1;
        let bestPhrase = false;

        for (const ayah of surah.ayahs) {
          const rawAyahText = ayah.text || ayah.arabicText || "";
          const normalizedAyah = normalizeLooseText(rawAyahText);
          const coverage = termTokens.length === 0
            ? 0
            : termTokens.filter((token) => normalizedAyah.includes(token)).length;
          const hasPhrase = normalizedTerm.length > 0 && normalizedAyah.includes(normalizedTerm);

          if (
            coverage > bestCoverage ||
            (coverage === bestCoverage && hasPhrase && !bestPhrase)
          ) {
            bestAyah = ayah;
            bestCoverage = coverage;
            bestPhrase = hasPhrase;
          }
        }

        let score = 3;

        if (startsWithName) {
          score = 0;
        } else if (includesName) {
          score = 1;
        } else if (bestPhrase) {
          score = 2;
        } else if (bestCoverage > 0) {
          score = 3;
        } else {
          score = 4;
        }

        return {
          score,
          coverage: bestCoverage,
          hasPhrase: bestPhrase,
          startsWithName,
          includesName,
          surah,
          firstAyah: bestAyah,
        };
      })
      .filter((item) => {
        if (item.startsWithName || item.includesName || item.hasPhrase) {
          return true;
        }

        if (termTokens.length === 0) {
          return true;
        }

        const minCoverage = termTokens.length >= 6
          ? Math.ceil(termTokens.length * 0.5)
          : termTokens.length >= 3
            ? 2
            : 1;

        return item.coverage >= minCoverage;
      })
      .sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }

        if (a.coverage !== b.coverage) {
          return b.coverage - a.coverage;
        }

        if (a.hasPhrase !== b.hasPhrase) {
          return a.hasPhrase ? -1 : 1;
        }

        return a.surah.number - b.surah.number;
      })
      .slice(0, limit)
      .map(({ surah, firstAyah }) => ({
        id: `surah-${surah.id}`,
        surahId: surah.id,
        surahNumber: surah.number,
        surahName: surah.name,
        matchedAyahNumber: firstAyah?.number ?? null,
        matchedAyahText: firstAyah ? clipText(firstAyah.text || firstAyah.arabicText || "") : null,
      }));

    clearDatabaseUnavailable();
    return ranked;
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      markDatabaseUnavailable();
    }

    return [] as QuranSearchResult[];
  }
}

export async function detectEntryDuplicates(input: {
  title: string;
  content: string;
  hadithNumber?: string | null;
  bookId?: string | null;
  ignoreEntryId?: string;
}) {
  const trimmedTitle = input.title.trim();
  const sampleContent = input.content.trim().slice(0, 150);

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return [];
  }

  try {
    const duplicates = await prisma.entry.findMany({
      where: {
        id: input.ignoreEntryId ? { not: input.ignoreEntryId } : undefined,
        OR: [
          { title: { equals: trimmedTitle, mode: "insensitive" } },
          ...(sampleContent ? [{ content: { contains: sampleContent, mode: "insensitive" as const } }] : []),
          ...(input.bookId && input.hadithNumber
            ? [
                {
                  bookId: input.bookId,
                  hadithNumber: input.hadithNumber,
                },
              ]
            : []),
        ],
      },
      include: {
        section: true,
        book: true,
      },
      take: 5,
    });
    clearDatabaseUnavailable();
    return duplicates;
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      markDatabaseUnavailable();
    }
    return [];
  }
}

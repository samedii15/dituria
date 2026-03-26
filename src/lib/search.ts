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

export async function searchEntries(options: SearchOptions) {
  const term = options.query.trim();

  if (!term) {
    return [];
  }

  const limit = Math.min(Math.max(options.limit || 12, 1), 40);

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
              { tags: { hasSome: term.split(/\s+/).filter(Boolean) } },
              { source: { contains: term, mode: "insensitive" } },
              { hadithNumber: { contains: term, mode: "insensitive" } },
              { section: { name: { contains: term, mode: "insensitive" } } },
              { category: { name: { contains: term, mode: "insensitive" } } },
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

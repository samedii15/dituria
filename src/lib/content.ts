import { prisma } from "@/lib/prisma";
import {
  canAttemptDatabase,
  clearDatabaseUnavailable,
  isDatabaseUnavailableError,
  markDatabaseUnavailable,
  shouldSkipDatabase,
} from "@/lib/db-health";
import { HADITH_BOOKS, SECTION_LABELS, SECTION_ORDER } from "@/lib/sections";

function buildFallbackSections() {
  return SECTION_ORDER.map((slug, index) => ({
    id: `fallback-section-${index}`,
    slug,
    name: SECTION_LABELS[slug],
    intro: `Permbajtje per seksionin ${SECTION_LABELS[slug]}.`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

function buildFallbackBooks() {
  return HADITH_BOOKS.map((book, index) => ({
    id: `fallback-book-${index}`,
    slug: book.slug,
    title: book.title,
    description: "Koleksion hadithesh.",
    _count: {
      entries: 0,
      chapters: 0,
    },
  }));
}

export async function getHomeData() {
  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return {
      sections: buildFallbackSections(),
      latestEntries: [],
      featuredHadith: null,
      books: buildFallbackBooks(),
    };
  }

  try {
    const [sections, latestEntries, featuredHadith, books] = await Promise.all([
      prisma.section.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.entry.findMany({
        where: { isPublished: true },
        include: { section: true, book: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.entry.findFirst({
        where: { isPublished: true, section: { slug: "hadithet" } },
        include: { section: true, book: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.hadithBook.findMany({
        orderBy: { title: "asc" },
        take: 8,
        include: {
          _count: {
            select: {
              entries: true,
              chapters: true,
            },
          },
        },
      }),
    ]);

    clearDatabaseUnavailable();
    return { sections, latestEntries, featuredHadith, books };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    markDatabaseUnavailable();

    return {
      sections: buildFallbackSections(),
      latestEntries: [],
      featuredHadith: null,
      books: buildFallbackBooks(),
    };
  }
}

export async function getSectionBySlug(slug: string) {
  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    const labels = SECTION_LABELS[slug as keyof typeof SECTION_LABELS];

    if (!labels) {
      return null;
    }

    return {
      id: `fallback-${slug}`,
      slug,
      name: labels,
      intro: `Permbajtje per seksionin ${labels}.`,
      categories: [],
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  try {
    const section = await prisma.section.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { name: "asc" },
        },
        entries: {
          where: { isPublished: true },
          orderBy: { updatedAt: "desc" },
          include: {
            category: true,
            book: true,
          },
        },
      },
    });
    clearDatabaseUnavailable();
    return section;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    markDatabaseUnavailable();

    const labels = SECTION_LABELS[slug as keyof typeof SECTION_LABELS];

    if (!labels) {
      return null;
    }

    return {
      id: `fallback-${slug}`,
      slug,
      name: labels,
      intro: `Permbajtje per seksionin ${labels}.`,
      categories: [],
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getHadithBooks() {
  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return buildFallbackBooks();
  }

  try {
    const books = await prisma.hadithBook.findMany({
      include: {
        _count: {
          select: {
            chapters: true,
            entries: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });
    clearDatabaseUnavailable();
    return books;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    markDatabaseUnavailable();

    return buildFallbackBooks();
  }
}

export async function getHadithBookDetail(slug: string) {
  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    const book = HADITH_BOOKS.find((item) => item.slug === slug);

    if (!book) {
      return null;
    }

    return {
      id: `fallback-book-${slug}`,
      slug,
      title: book.title,
      description: "Koleksion hadithesh.",
      chapters: [],
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  try {
    const bookDetail = await prisma.hadithBook.findUnique({
      where: { slug },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            entries: {
              where: { isPublished: true },
              orderBy: { hadithNumber: "asc" },
            },
          },
        },
        entries: {
          where: { isPublished: true },
          include: { chapter: true, section: true },
          orderBy: [{ chapter: { order: "asc" } }, { hadithNumber: "asc" }],
        },
      },
    });
    clearDatabaseUnavailable();
    return bookDetail;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    markDatabaseUnavailable();

    const book = HADITH_BOOKS.find((item) => item.slug === slug);

    if (!book) {
      return null;
    }

    return {
      id: `fallback-book-${slug}`,
      slug,
      title: book.title,
      description: "Koleksion hadithesh.",
      chapters: [],
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getEntryById(id: string) {
  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return null;
  }

  try {
    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        section: true,
        category: true,
        book: true,
        chapter: true,
      },
    });
    clearDatabaseUnavailable();
    return entry;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    markDatabaseUnavailable();

    return null;
  }
}

export async function getQuranSurahs() {
  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return [];
  }

  try {
    const surahs = await prisma.surah.findMany({
      include: {
        ayahs: {
          orderBy: { number: "asc" },
        },
      },
      orderBy: { number: "asc" },
    });
    clearDatabaseUnavailable();
    return surahs;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    markDatabaseUnavailable();
    return [];
  }
}

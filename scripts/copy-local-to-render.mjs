import { PrismaClient } from "@prisma/client";

function getEnv(name, fallbackNames = []) {
  const names = [name, ...fallbackNames];

  for (const key of names) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  throw new Error(`Missing required environment variable: ${names.join(" or ")}`);
}

function printUsage() {
  console.log("Usage:");
  console.log("LOCAL_DATABASE_URL=<local-url> RAILWAY_DATABASE_URL=<railway-url> npm run db:sync:railway");
  console.log("LOCAL_DATABASE_URL=<local-url> RENDER_DATABASE_URL=<target-url> npm run db:copy:to-render");
}

async function main() {
  const sourceUrl = getEnv("LOCAL_DATABASE_URL");
  const targetUrl = getEnv("RAILWAY_DATABASE_URL", ["RENDER_DATABASE_URL", "TARGET_DATABASE_URL"]);

  if (sourceUrl === targetUrl) {
    throw new Error("LOCAL_DATABASE_URL and RENDER_DATABASE_URL must be different.");
  }

  const source = new PrismaClient({ datasourceUrl: sourceUrl });
  const target = new PrismaClient({ datasourceUrl: targetUrl });

  try {
    const [
      sections,
      categories,
      hadithBooks,
      hadithChapters,
      surahs,
      ayahs,
      entries,
      entryRevisions,
    ] = await Promise.all([
      source.section.findMany(),
      source.category.findMany(),
      source.hadithBook.findMany(),
      source.hadithChapter.findMany(),
      source.surah.findMany(),
      source.ayah.findMany(),
      source.entry.findMany(),
      source.entryRevision.findMany(),
    ]);

    await target.$executeRawUnsafe(
      'TRUNCATE TABLE "EntryRevision", "Entry", "Ayah", "Surah", "HadithChapter", "HadithBook", "Category", "Section" RESTART IDENTITY CASCADE;'
    );

    if (sections.length) {
      await target.section.createMany({ data: sections });
    }
    if (categories.length) {
      await target.category.createMany({ data: categories });
    }
    if (hadithBooks.length) {
      await target.hadithBook.createMany({ data: hadithBooks });
    }
    if (hadithChapters.length) {
      await target.hadithChapter.createMany({ data: hadithChapters });
    }
    if (surahs.length) {
      await target.surah.createMany({ data: surahs });
    }
    if (ayahs.length) {
      await target.ayah.createMany({ data: ayahs });
    }
    if (entries.length) {
      await target.entry.createMany({ data: entries });
    }
    if (entryRevisions.length) {
      await target.entryRevision.createMany({ data: entryRevisions });
    }

    console.log("Import completed successfully.");
    console.log(
      JSON.stringify(
        {
          sections: sections.length,
          categories: categories.length,
          hadithBooks: hadithBooks.length,
          hadithChapters: hadithChapters.length,
          surahs: surahs.length,
          ayahs: ayahs.length,
          entries: entries.length,
          entryRevisions: entryRevisions.length,
        },
        null,
        2
      )
    );
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((error) => {
  printUsage();
  console.error(error);
  process.exit(1);
});

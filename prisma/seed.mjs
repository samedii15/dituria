import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sections = [
    { slug: "hadithet", name: "Hadithet", intro: "Hadithet sipas librave dhe kapitujve." },
    { slug: "lutjet", name: "Lutjet", intro: "Lutje te perditshme sipas kategorive." },
    { slug: "fikh", name: "Fikh", intro: "Ceshtje praktike te fese islame." },
    { slug: "akide", name: "Akide", intro: "Besimi islam ne menyre te qarte." },
    { slug: "kuran", name: "Kuran", intro: "Suret dhe ajetet." },
    { slug: "historite-e-pejgambereve", name: "Historite e Pejgambereve", intro: "Mesime nga historite e pejgambereve." },
  ];

  for (const section of sections) {
    const bySlug = await prisma.section.findUnique({ where: { slug: section.slug } });
    if (bySlug) {
      await prisma.section.update({ where: { id: bySlug.id }, data: section });
      continue;
    }

    const byName = await prisma.section.findFirst({ where: { name: section.name } });
    if (byName) {
      await prisma.section.update({ where: { id: byName.id }, data: section });
      continue;
    }

    await prisma.section.create({ data: section });
  }

  const lutjet = await prisma.section.findUniqueOrThrow({ where: { slug: "lutjet" } });
  const fikh = await prisma.section.findUniqueOrThrow({ where: { slug: "fikh" } });
  const akide = await prisma.section.findUniqueOrThrow({ where: { slug: "akide" } });

  const prayerCategories = [
    { slug: "mengjes", name: "Mengjes" },
    { slug: "mbremje", name: "Mbremje" },
    { slug: "para-gjumit", name: "Para gjumit" },
    { slug: "ushqim", name: "Ushqim" },
    { slug: "udhetim", name: "Udhetim" },
    { slug: "mbrojtje", name: "Mbrojtje" },
  ];

  for (const category of prayerCategories) {
    await prisma.category.upsert({
      where: { sectionId_slug: { sectionId: lutjet.id, slug: category.slug } },
      update: { name: category.name },
      create: { sectionId: lutjet.id, slug: category.slug, name: category.name },
    });
  }

  const fikhCategories = [
    { slug: "abdesi", name: "Abdesi" },
    { slug: "namazi", name: "Namazi" },
    { slug: "agjerimi", name: "Agjerimi" },
  ];

  for (const category of fikhCategories) {
    await prisma.category.upsert({
      where: { sectionId_slug: { sectionId: fikh.id, slug: category.slug } },
      update: { name: category.name },
      create: { sectionId: fikh.id, slug: category.slug, name: category.name },
    });
  }

  await prisma.category.upsert({
    where: { sectionId_slug: { sectionId: akide.id, slug: "bazat-e-besimit" } },
    update: { name: "Bazat e besimit" },
    create: { sectionId: akide.id, slug: "bazat-e-besimit", name: "Bazat e besimit" },
  });

  const hadithBook = await prisma.hadithBook.upsert({
    where: { slug: "sahih-bukhari" },
    update: { title: "Sahih el-Buhari", description: "Koleksion i haditheve autentike." },
    create: {
      slug: "sahih-bukhari",
      title: "Sahih el-Buhari",
      description: "Koleksion i haditheve autentike.",
    },
  });

  const hadithChapter = await prisma.hadithChapter.upsert({
    where: { bookId_slug: { bookId: hadithBook.id, slug: "shpallja" } },
    update: { title: "Kapitulli i shpalljes", order: 1 },
    create: {
      bookId: hadithBook.id,
      slug: "shpallja",
      title: "Kapitulli i shpalljes",
      order: 1,
    },
  });

  const hadithSection = await prisma.section.findUniqueOrThrow({ where: { slug: "hadithet" } });

  await prisma.entry.upsert({
    where: { bookId_hadithNumber: { bookId: hadithBook.id, hadithNumber: "1" } },
    update: {
      sectionId: hadithSection.id,
      chapterId: hadithChapter.id,
      title: "Veprat jane sipas qellimeve",
      content: "Veprat vleresohen sipas qellimeve dhe cdo njeri do marre ate qe ka pasur per qellim.",
      source: "Buhari 1",
      isPublished: true,
      tags: ["hadith", "qellimi"],
    },
    create: {
      sectionId: hadithSection.id,
      bookId: hadithBook.id,
      chapterId: hadithChapter.id,
      hadithNumber: "1",
      title: "Veprat jane sipas qellimeve",
      content: "Veprat vleresohen sipas qellimeve dhe cdo njeri do marre ate qe ka pasur per qellim.",
      source: "Buhari 1",
      isPublished: true,
      tags: ["hadith", "qellimi"],
    },
  });

  const firstSurah = await prisma.surah.upsert({
    where: { number: 1 },
    update: { name: "El-Fatiha" },
    create: { number: 1, name: "El-Fatiha" },
  });

  const ayahs = [
    { number: 1, text: "Me emrin e Allahut, Meshiruesit, Meshireberesit.", arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
    { number: 2, text: "Falenderimi i takon Allahut, Zotit te boteve.", arabicText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
    { number: 3, text: "Meshiruesit, Meshireberesit.", arabicText: "الرَّحْمَٰنِ الرَّحِيمِ" },
    { number: 4, text: "Sunduesit te Dites se Gjykimit.", arabicText: "مَالِكِ يَوْمِ الدِّينِ" },
  ];

  for (const ayah of ayahs) {
    await prisma.ayah.upsert({
      where: { surahId_number: { surahId: firstSurah.id, number: ayah.number } },
      update: { text: ayah.text, arabicText: ayah.arabicText },
      create: {
        surahId: firstSurah.id,
        number: ayah.number,
        text: ayah.text,
        arabicText: ayah.arabicText,
      },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

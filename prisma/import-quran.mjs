import fs from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SURAH_NAMES = {
  1: "El-Fatiha",
  2: "El-Bekare",
  3: "Ali Imran",
  4: "En-Nisa",
  5: "El-Maide",
  6: "El-Enam",
  7: "El-Araf",
  8: "El-Enfal",
  9: "Et-Teube",
  10: "Junus",
  11: "Hud",
  12: "Jusuf",
  13: "Er-Rad",
  14: "Ibrahim",
  15: "El-Hixhr",
  16: "En-Nahl",
  17: "El-Isra",
  18: "El-Kehf",
  19: "Merjem",
  20: "Ta-Ha",
  21: "El-Enbija",
  22: "El-Haxh",
  23: "El-Muminun",
  24: "En-Nur",
  25: "El-Furkan",
  26: "Esh-Shuara",
  27: "En-Neml",
  28: "El-Kasas",
  29: "El-Ankebut",
  30: "Er-Rum",
  31: "Lukman",
  32: "Es-Sexhde",
  33: "El-Ahzab",
  34: "Sebe",
  35: "Fatir",
  36: "Ja-Sin",
  37: "Es-Saffat",
  38: "Sad",
  39: "Ez-Zumer",
  40: "Gafir",
  41: "Fussilet",
  42: "Esh-Shura",
  43: "Ez-Zuhruf",
  44: "Ed-Duhan",
  45: "El-Xhathije",
  46: "El-Ahkaf",
  47: "Muhammed",
  48: "El-Fet'h",
  49: "El-Huxhurat",
  50: "Kaf",
  51: "Edh-Dharijat",
  52: "Et-Tur",
  53: "En-Nexhm",
  54: "El-Kamer",
  55: "Er-Rahman",
  56: "El-Vakia",
  57: "El-Hadid",
  58: "El-Muxhadele",
  59: "El-Hashr",
  60: "El-Mumtehine",
  61: "Es-Saff",
  62: "El-Xhumua",
  63: "El-Munafikun",
  64: "Et-Tegabun",
  65: "Et-Talak",
  66: "Et-Tahrim",
  67: "El-Mulk",
  68: "El-Kalem",
  69: "El-Hakka",
  70: "El-Mearixh",
  71: "Nuh",
  72: "El-Xhinn",
  73: "El-Muzzemmil",
  74: "El-Muddeththir",
  75: "El-Kijame",
  76: "El-Insan",
  77: "El-Murselat",
  78: "En-Nebe",
  79: "En-Naziat",
  80: "Abese",
  81: "Et-Tekvir",
  82: "El-Infitar",
  83: "El-Mutaffifin",
  84: "El-Inshikak",
  85: "El-Buruxh",
  86: "Et-Tarik",
  87: "El-Ala",
  88: "El-Gashije",
  89: "El-Fexhr",
  90: "El-Beled",
  91: "Esh-Shems",
  92: "El-Lejl",
  93: "Ed-Duha",
  94: "Esh-Sherh",
  95: "Et-Tin",
  96: "El-Alak",
  97: "El-Kadr",
  98: "El-Bejjine",
  99: "Ez-Zelzele",
  100: "El-Adijat",
  101: "El-Karia",
  102: "Et-Tekathur",
  103: "El-Asr",
  104: "El-Humeze",
  105: "El-Fil",
  106: "Kurejsh",
  107: "El-Maun",
  108: "El-Keuther",
  109: "El-Kafirun",
  110: "En-Nasr",
  111: "El-Mesed",
  112: "El-Ihlas",
  113: "El-Felek",
  114: "En-Nas",
};

function pickTranslation(ayah) {
  return (ayah.albanian || ayah.translation_sq || ayah.text || "").trim();
}

function pickArabic(ayah) {
  const value = (ayah.arabic || ayah.arabicText || "").trim();
  return value || null;
}

async function main() {
  const fileArg = process.argv[2];
  const dataPath = fileArg
    ? path.resolve(fileArg)
    : path.join(process.cwd(), "prisma", "data", "quran_ar_sq_by_surah.json");

  const rawFile = await fs.readFile(dataPath, "utf8");
  const parsed = JSON.parse(rawFile);

  let totalSurahs = 0;
  let totalAyahs = 0;

  const surahNumbers = Object.keys(parsed)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 114)
    .sort((a, b) => a - b);

  for (const surahNumber of surahNumbers) {
    const sourceAyahs = Array.isArray(parsed[String(surahNumber)]) ? parsed[String(surahNumber)] : [];

    const existingSurah = await prisma.surah.findUnique({ where: { number: surahNumber } });
    const surahName = existingSurah?.name?.trim() || SURAH_NAMES[surahNumber] || `Sure ${surahNumber}`;

    const surah = await prisma.surah.upsert({
      where: { number: surahNumber },
      update: { name: surahName },
      create: { number: surahNumber, name: surahName },
    });

    const ayahs = sourceAyahs
      .map((ayah, index) => {
        const text = pickTranslation(ayah);
        const arabicText = pickArabic(ayah);

        if (!text) {
          return null;
        }

        return {
          surahId: surah.id,
          number: Number.isInteger(ayah.ayah) ? Number(ayah.ayah) : index + 1,
          arabicText,
          text,
        };
      })
      .filter(Boolean);

    await prisma.$transaction(async (tx) => {
      await tx.ayah.deleteMany({ where: { surahId: surah.id } });
      if (ayahs.length > 0) {
        await tx.ayah.createMany({ data: ayahs });
      }
    });

    totalSurahs += 1;
    totalAyahs += ayahs.length;
  }

  console.log(`Import completed: ${totalSurahs} sure, ${totalAyahs} ajete.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
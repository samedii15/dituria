export const SECTION_ORDER = [
  "hadithet",
  "lutjet",
  "kuran",
  "historite-e-pejgambereve",
  "akide",
  "fikh",
] as const;

export const SECTION_LABELS = {
  hadithet: "Hadithet",
  lutjet: "Lutjet",
  kuran: "Kuran",
  "historite-e-pejgambereve": "Historite e Pejgambereve",
  akide: "Akide",
  fikh: "Fikh",
} as const;

export const HADITH_BOOKS = [
  {
    slug: "sahih-al-bukhari",
    title: "Sahih al-Bukhari",
  },
  {
    slug: "sahih-muslim",
    title: "Sahih Muslim",
  },
  {
    slug: "riyad-us-salihin",
    title: "Riyad us-Salihin",
  },
  {
    slug: "sunan-abu-dawud",
    title: "Sunan Abu Dawud",
  },
  {
    slug: "jami-at-tirmidhi",
    title: "Jami at-Tirmidhi",
  },
  {
    slug: "sunan-an-nasai",
    title: "Sunan an-Nasai",
  },
  {
    slug: "sunan-ibn-majah",
    title: "Sunan Ibn Majah",
  },
  {
    slug: "muwatta-malik",
    title: "Muwatta Malik",
  },
] as const;

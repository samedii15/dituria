"use client";

import { Noto_Naskh_Arabic } from "next/font/google";

type QuranAyah = {
  id: string;
  number: number;
  arabicText: string | null;
  text: string;
};

type SurahItem = {
  id: string;
  number: number;
  name: string;
  totalAyahs: number;
  matchedAyahs: QuranAyah[];
  matchedBySurahName: boolean;
};

type Props = {
  surah: SurahItem;
  isOpen: boolean;
  viewMode: "bilingual" | "arabic-only";
  hasActiveSearch: boolean;
  onToggle: () => void;
};

const arabicFont = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
});

export function QuranSurahAccordionItem({ surah, isOpen, viewMode, hasActiveSearch, onToggle }: Props) {
  const isArabicOnly = viewMode === "arabic-only";
  const ayahsToShow = hasActiveSearch && !surah.matchedBySurahName ? surah.matchedAyahs : surah.matchedAyahs;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition hover:border-[var(--accent)]/60">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
      >
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.09em] text-[var(--accent)]">Sure {surah.number}</p>
          <h3 className="text-xl font-semibold text-[var(--primary)]">{surah.name}</h3>
          <p className="text-xs muted">
            {surah.totalAyahs} ajete
            {hasActiveSearch && !surah.matchedBySurahName ? ` • ${surah.matchedAyahs.length} perputhje` : ""}
          </p>
        </div>
        <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--primary)]">
          {isOpen ? "Mbyll" : "Hap"}
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-[var(--border)] bg-[#fffcf5] px-4 py-5 sm:px-5">
          {surah.matchedBySurahName && hasActiveSearch ? <p className="mb-3 text-xs muted">Perputhje me emrin e sures</p> : null}

          {isArabicOnly ? (
            <div className="mx-auto w-full max-w-3xl space-y-6">
              {surah.number !== 1 && surah.number !== 9 ? (
                <p className={`text-center text-2xl text-[var(--primary)]/90 ${arabicFont.className}`} dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              ) : null}

              {ayahsToShow.map((ayah) => (
                <div key={ayah.id} className="space-y-2 text-right">
                  <span className="inline-flex items-center rounded-full bg-[#f3ede0] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    {ayah.number}
                  </span>
                  {ayah.arabicText ? (
                    <p className={`text-4xl leading-[2.15] text-[var(--primary)] sm:text-5xl sm:leading-[2.25] ${arabicFont.className}`} dir="rtl">
                      {ayah.arabicText}
                    </p>
                  ) : (
                    <p className="text-sm muted">(Teksti arabisht mungon)</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {ayahsToShow.map((ayah) => (
                <div key={ayah.id} className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--accent)]">Ajeti {ayah.number}</p>
                  {ayah.arabicText ? <p className={`mt-2 text-right text-xl leading-relaxed ${arabicFont.className}`} dir="rtl">{ayah.arabicText}</p> : null}
                  <p className="mt-2 text-[15px] leading-7 text-[#425046]">{ayah.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
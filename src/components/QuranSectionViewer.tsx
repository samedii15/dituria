"use client";

import { useEffect, useMemo, useState } from "react";
import { QuranSurahAccordionItem } from "@/components/QuranSurahAccordionItem";

type QuranAyah = {
  id: string;
  number: number;
  arabicText: string | null;
  text: string;
};

type QuranSurah = {
  id: string;
  number: number;
  name: string;
  ayahs: QuranAyah[];
};

type Props = {
  surahs: QuranSurah[];
  initialQuery?: string;
};

type ViewMode = "bilingual" | "arabic-only";

const VIEW_MODE_STORAGE_KEY = "quran-view-mode";

function normalize(value: string) {
  return value.toLocaleLowerCase();
}

export function QuranSectionViewer({ surahs, initialQuery }: Props) {
  const initialTerm = (initialQuery || "").trim();
  const [query, setQuery] = useState(initialTerm);
  const [debouncedQuery, setDebouncedQuery] = useState(initialTerm);
  const [openSurahId, setOpenSurahId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") {
      return "bilingual";
    }

    try {
      const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      return stored === "arabic-only" ? "arabic-only" : "bilingual";
    } catch {
      return "bilingual";
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 180);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      // Ignore storage errors in restricted browsers.
    }
  }, [viewMode]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) {
      return surahs.map((surah) => ({
        ...surah,
        totalAyahs: surah.ayahs.length,
        matchedBySurahName: false,
        matchedAyahs: surah.ayahs,
      }));
    }

    const term = normalize(debouncedQuery);

    return surahs
      .map((surah) => {
        const surahNameMatch = normalize(surah.name).includes(term);

        if (surahNameMatch) {
          return {
            ...surah,
            totalAyahs: surah.ayahs.length,
            matchedBySurahName: true,
            matchedAyahs: surah.ayahs,
          };
        }

        const matchedAyahs = surah.ayahs.filter((ayah) => {
          const albanianMatch = normalize(ayah.text).includes(term);
          const arabicMatch = normalize(ayah.arabicText || "").includes(term);
          return albanianMatch || arabicMatch;
        });

        if (matchedAyahs.length === 0) {
          return null;
        }

        return {
          ...surah,
          totalAyahs: surah.ayahs.length,
          matchedBySurahName: false,
          matchedAyahs,
        };
      })
      .filter(Boolean) as Array<QuranSurah & { totalAyahs: number; matchedBySurahName: boolean; matchedAyahs: QuranAyah[] }>;
  }, [debouncedQuery, surahs]);

  const isArabicOnly = viewMode === "arabic-only";

  return (
    <section className="space-y-4">
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--primary)]">Kerkim ne Kuran</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kerko sure ose ajet..."
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[var(--primary)]">Pamja:</span>
            <button
              type="button"
              className={`rounded-full border px-3 py-1.5 text-sm ${!isArabicOnly ? "border-[var(--primary)] bg-[#eef5f1] text-[var(--primary)]" : "border-[var(--border)] bg-white"}`}
              onClick={() => setViewMode("bilingual")}
            >
              Arabisht + Shqip
            </button>
            <button
              type="button"
              className={`rounded-full border px-3 py-1.5 text-sm ${isArabicOnly ? "border-[var(--primary)] bg-[#eef5f1] text-[var(--primary)]" : "border-[var(--border)] bg-white"}`}
              onClick={() => setViewMode("arabic-only")}
            >
              Vetem Arabisht
            </button>
          </div>
        </div>
      </div>

      <h2 className="mb-1 text-3xl font-semibold text-[var(--primary)]">Suret e Kuranit</h2>
      <p className="text-sm muted">
        Zgjidh nje sure per te lexuar ajetet. Gjithsej: {filtered.length} sure
      </p>

      {filtered.length === 0 ? (
        <p className="card p-4 muted">Nuk u gjet asnje rezultat.</p>
      ) : null}

      <div className="space-y-3">
        {filtered.map((surah) => (
          <QuranSurahAccordionItem
            key={surah.id}
            surah={surah}
            isOpen={openSurahId === surah.id}
            viewMode={viewMode}
            hasActiveSearch={Boolean(debouncedQuery)}
            onToggle={() => setOpenSurahId((current) => (current === surah.id ? null : surah.id))}
          />
        ))}
      </div>
    </section>
  );
}
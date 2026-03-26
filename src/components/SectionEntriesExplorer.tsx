"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SectionCategory = {
  id: string;
  name: string;
  slug?: string;
};

type SectionEntry = {
  id: string;
  title: string;
  content: string;
  category?: { id: string; name: string } | null;
  book?: { title: string } | null;
};

type Props = {
  categories: SectionCategory[];
  entries: SectionEntry[];
};

function includesText(value: string, term: string) {
  return value.toLocaleLowerCase().includes(term);
}

export function SectionEntriesExplorer({ categories, entries }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredEntries = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    return entries.filter((entry) => {
      const categoryMatch = activeCategoryId ? entry.category?.id === activeCategoryId : true;

      if (!categoryMatch) return false;
      if (!term) return true;

      return (
        includesText(entry.title, term) ||
        includesText(entry.content, term) ||
        includesText(entry.category?.name || "", term) ||
        includesText(entry.book?.title || "", term)
      );
    });
  }, [entries, activeCategoryId, query]);

  const hasActiveFilters = Boolean(activeCategoryId || query.trim());

  return (
    <section className="space-y-6">
      <section className="card p-6">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">Kategorite</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((category) => {
              const isActive = activeCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategoryId((current) => (current === category.id ? null : category.id))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${isActive ? "border-[var(--primary)] bg-[#e9f2ee] font-semibold text-[var(--primary)]" : "border-[var(--border)] bg-white hover:border-[var(--accent)] hover:bg-[#faf6ec]"}`}
                >
                  {category.name}
                </button>
              );
            })
          ) : (
            <p className="muted">Asnje kategori ende.</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--primary)]">Kerko ne kete seksion</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kerko sipas titullit ose tekstit..."
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3"
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-3xl font-semibold text-[var(--primary)]">Permbajtja</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredEntries.map((entry) => (
            <Link key={entry.id} href={`/entries/${entry.id}`} className="card p-5">
              <p className="text-xl font-semibold text-[var(--primary)]">{entry.title}</p>
              <p className="mt-2 line-clamp-3 text-sm muted">{entry.content}</p>
              <p className="mt-3 text-xs text-[var(--accent)]">
                {entry.category ? entry.category.name : "Pa kategori"}
                {entry.book ? ` • ${entry.book.title}` : ""}
              </p>
            </Link>
          ))}

          {filteredEntries.length === 0 ? (
            <p className="muted">
              {hasActiveFilters
                ? activeCategoryId && !query.trim()
                  ? "Nuk ka permbajtje ne kete kategori ende."
                  : "Nuk u gjet asnje rezultat."
                : "Nuk ka permbajtje te publikuar."}
            </p>
          ) : null}
        </div>
      </section>
    </section>
  );
}
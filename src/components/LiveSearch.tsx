"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SearchResult = {
  id: string;
  title: string;
  section: { name: string; slug: string };
  book: { title: string; slug: string } | null;
};

type Props = {
  sectionSlug?: string;
  bookSlug?: string;
  placeholder?: string;
};

export function LiveSearch({ sectionSlug, bookSlug, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (sectionSlug) params.set("section", sectionSlug);
    if (bookSlug) params.set("book", bookSlug);
    params.set("limit", "40");
    return `/api/search?${params.toString()}`;
  }, [sectionSlug, bookSlug]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`${endpoint}&q=${encodeURIComponent(term)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, endpoint]);

  return (
    <div className="relative w-full">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base outline-none ring-[var(--accent)] transition focus:ring-2"
        placeholder={
          placeholder || "Kerko hadithe, tema, etiketa..."
        }
      />

      {(loading || results.length > 0) && (
        <div className="card absolute top-14 z-30 w-full overflow-hidden">
          {loading ? (
            <p className="px-4 py-3 text-sm muted">Duke kerkuar...</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((item) => (
                <li key={item.id} className="border-b border-[var(--border)] last:border-b-0">
                  <Link href={`/entries/${item.id}`} className="block px-4 py-3 hover:bg-[#faf6ec]">
                    <p className="font-semibold text-[var(--primary)]">
                      {item.title}
                    </p>
                    <p className="text-xs muted">
                      {item.section.name}
                      {item.book ? ` • ${item.book.title}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

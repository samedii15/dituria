"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchResult = {
  id: string;
  title: string;
  section: { name: string; slug: string };
  book: { title: string; slug: string } | null;
  href: string;
  subtitle?: string;
};

type Props = {
  sectionSlug?: string;
  bookSlug?: string;
  placeholder?: string;
};

export function LiveSearch({ sectionSlug, bookSlug, placeholder }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasError, setHasError] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (sectionSlug) params.set("section", sectionSlug);
    if (bookSlug) params.set("book", bookSlug);
    params.set("mode", "typeahead");
    params.set("limit", "40");
    return `/api/search?${params.toString()}`;
  }, [sectionSlug, bookSlug]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setHasSearched(false);
      setHasError(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasError(false);

      try {
        const response = await fetch(`${endpoint}&q=${encodeURIComponent(term)}`);
        if (!response.ok) {
          throw new Error("Search request failed");
        }
        const data = await response.json();
        setResults(data.results || []);
        setHasSearched(true);
      } catch {
        setResults([]);
        setHasSearched(true);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, endpoint]);

  useEffect(() => {
    function handleOutsideTap(event: MouseEvent | TouchEvent) {
      if (!rootRef.current) return;

      const target = event.target;
      if (target instanceof Node && !rootRef.current.contains(target)) {
        setResults([]);
      }
    }

    document.addEventListener("mousedown", handleOutsideTap);
    document.addEventListener("touchstart", handleOutsideTap, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsideTap);
      document.removeEventListener("touchstart", handleOutsideTap);
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();

    if (!term) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const showDropdown = query.trim().length >= 2;
  const showNoResults = showDropdown && hasSearched && !loading && !hasError && results.length === 0;
  const showError = showDropdown && hasError && !loading;

  return (
    <div ref={rootRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base outline-none ring-[var(--accent)] transition focus:ring-2"
          placeholder={
            placeholder || "Kerko hadithe, tema, etiketa..."
          }
        />
      </form>

      {(showDropdown && (loading || results.length > 0 || showNoResults || showError)) && (
        <div className="card absolute top-14 z-30 w-full overflow-hidden">
          {loading ? (
            <p className="px-4 py-3 text-sm muted">Duke kerkuar...</p>
          ) : showError ? (
            <p className="px-4 py-3 text-sm muted">Ndodhi nje problem gjate kerkimit. Provo perseri.</p>
          ) : showNoResults ? (
            <p className="px-4 py-3 text-sm muted">Asnje rezultat.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((item) => (
                <li key={item.id} className="border-b border-[var(--border)] last:border-b-0">
                  <Link href={item.href} className="block px-4 py-3.5 hover:bg-[#faf6ec]">
                    <p className="font-semibold text-[var(--primary)]">
                      {item.title}
                    </p>
                    <p className="text-xs muted">
                      {item.section.name}
                      {item.book ? ` • ${item.book.title}` : ""}
                    </p>
                    {item.subtitle ? <p className="mt-1 text-xs muted">{item.subtitle}</p> : null}
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

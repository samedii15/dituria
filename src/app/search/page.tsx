import Link from "next/link";

import { LiveSearch } from "@/components/LiveSearch";
import { searchEntries, searchQuran } from "@/lib/search";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function GlobalSearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchEntries({ query: q, limit: 80 }) : [];
  const quranResults = q.trim() ? await searchQuran({ query: q, limit: 114, mode: "full" }) : [];

  const grouped = new Map<string, typeof results>();

  for (const item of results) {
    const key = item.section?.name || 'Uncategorized';
    const existing = grouped.get(key) || [];
    existing.push(item);
    grouped.set(key, existing);
  }

  return (
    <div className="shell space-y-5 py-6 sm:space-y-6 sm:py-10">
      <h1 className="text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
        Kerkim Global
      </h1>
      <p className="max-w-2xl muted">
        Kerko ne te gjitha seksionet: hadithe, lutje, kuran, akide, fikh dhe histori.
      </p>
      <div className="card p-4 sm:p-6">
        <form className="mb-4 grid gap-2 sm:flex" action="/search" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Termi i kerkimit"
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3"
          />
          <button className="btn-primary min-h-11">Kerko</button>
        </form>
        <LiveSearch />
      </div>

      <div className="space-y-4">
        {[...grouped.entries()].map(([sectionName, entries]) => (
          <section key={sectionName} className="card p-5">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">{sectionName}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {entries.map((entry) => (
                <Link key={entry.id} href={`/entries/${entry.id}`} className="rounded-xl border border-[var(--border)] bg-white p-3 active:scale-[0.99]">
                  <p className="font-semibold text-[var(--primary)]">{entry.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm muted">{entry.content}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {quranResults.length > 0 ? (
          <section className="card p-5">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">Kuran</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {quranResults.map((item) => (
                <Link
                  key={item.id}
                  href={`/sections/kuran?q=${encodeURIComponent(q)}`}
                  className="rounded-xl border border-[var(--border)] bg-white p-3 active:scale-[0.99]"
                >
                  <p className="font-semibold text-[var(--primary)]">Sure {item.surahNumber}: {item.surahName}</p>
                  <p className="mt-1 text-sm muted">
                    {item.matchedAyahNumber && item.matchedAyahText
                      ? `Ajeti ${item.matchedAyahNumber}: ${item.matchedAyahText}`
                      : "Perputhje me emrin e sures"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {q.trim() && results.length === 0 && quranResults.length === 0 ? (
        <p className="card p-4 muted">Asnje rezultat.</p>
      ) : null}

      <div className="card p-6">
        <p className="text-sm muted">
          Per rezultate me te sakta, perdor fjale kyce, etiketa ose numer hadithi.
        </p>
        <Link href="/" className="mt-3 inline-block text-sm text-[var(--primary)] hover:underline">
          Kthehu ne faqen kryesore
        </Link>
      </div>
    </div>
  );
}

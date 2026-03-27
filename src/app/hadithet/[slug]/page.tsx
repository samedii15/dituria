import Link from "next/link";
import { notFound } from "next/navigation";

import { LiveSearch } from "@/components/LiveSearch";
import { getHadithBookDetail } from "@/lib/content";

type Params = {
  params: Promise<{ slug: string }>;
};

export default async function HadithBookDetailPage({ params }: Params) {
  const { slug } = await params;
  const book = await getHadithBookDetail(slug);

  if (!book) {
    notFound();
  }

  return (
    <div className="shell space-y-6 py-6 sm:space-y-8 sm:py-10">
      <section className="card p-5 sm:p-8">
        <p className="text-sm uppercase tracking-[0.08em] text-[var(--accent)]">Liber Hadithi</p>
        <h1 className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">{book.title}</h1>
        {('description' in book && book.description) ? <p className="mt-3 max-w-2xl muted">{book.description}</p> : null}
        <div className="mt-5">
          <LiveSearch sectionSlug="hadithet" bookSlug={book.slug} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="card h-fit p-4">
          <h2 className="text-xl font-semibold text-[var(--primary)]">Kapitujt</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {book.chapters.map((chapter: (typeof book.chapters)[number]) => (
              <li key={chapter.id} className="rounded-lg border border-[var(--border)] px-3 py-2">
                <p className="font-semibold">{chapter.title}</p>
                <p className="muted">{chapter.entries.length} hadithe</p>
              </li>
            ))}
            {book.chapters.length === 0 && <li className="muted">Nuk ka kapituj ende.</li>}
          </ul>
        </aside>

        <div className="space-y-3">
          {book.entries.map((entry: (typeof book.entries)[number]) => (
            <Link key={entry.id} href={`/entries/${entry.id}`} className="card block p-5 active:scale-[0.99]">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--accent)]">
                {entry.hadithNumber ? <span>#{entry.hadithNumber}</span> : null}
                {entry.chapter ? <span>• {entry.chapter.title}</span> : null}
              </div>
              <h3 className="mt-1 text-xl font-semibold text-[var(--primary)]">{entry.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm muted">{entry.content}</p>
            </Link>
          ))}
          {book.entries.length === 0 && (
            <p className="card p-5 muted">Nuk ka hadithe te publikuara.</p>
          )}
        </div>
      </section>
    </div>
  );
}

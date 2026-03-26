import Link from "next/link";
import { notFound } from "next/navigation";

import { getEntryById } from "@/lib/content";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function EntryDetailPage({ params }: Params) {
  const { id } = await params;
  const entry = await getEntryById(id);

  if (!entry || !entry.isPublished) {
    notFound();
  }

  const contentParagraphs = entry.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n+\s*/g, " ").trim())
    .filter(Boolean);

  return (
    <div className="shell py-10">
      <article className="card mx-auto w-full max-w-6xl overflow-hidden">
        <header className="border-b border-[var(--border)] bg-[#fdf9ef] px-6 py-7 sm:px-10 sm:py-9">
          <p className="text-sm uppercase tracking-[0.08em] text-[var(--accent)]">
            {entry.section?.name}
            {entry.book ? ` • ${entry.book.title}` : ""}
            {entry.hadithNumber ? ` • #${entry.hadithNumber}` : ""}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--primary)] sm:text-5xl">
            {entry.title}
          </h1>
          {entry.source ? <p className="mt-3 text-sm muted">Burimi: {entry.source}</p> : null}
        </header>

        <div className="px-6 py-7 sm:px-10 sm:py-9">
          {entry.arabicText ? (
            <p
              className="rounded-2xl border border-[var(--border)] bg-[#fffaf0] px-5 py-6 text-right text-2xl leading-loose sm:text-3xl"
              dir="rtl"
            >
              {entry.arabicText}
            </p>
          ) : null}

          <section className="mt-7 mx-auto w-full max-w-5xl space-y-5 text-[1.05rem] leading-8 text-[#24332a] sm:text-[1.12rem] sm:leading-9">
            {(contentParagraphs.length > 0 ? contentParagraphs : [entry.content]).map((paragraph, index) => (
              <p key={`${entry.id}-paragraph-${index}`}>
                {paragraph}
              </p>
            ))}
          </section>

          {entry.tags.length > 0 ? (
            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <p className="mb-3 text-sm font-semibold text-[var(--primary)]">Etiketa</p>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag: (typeof entry.tags)[number]) => (
                  <span key={tag} className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      <section className="card mx-auto mt-6 w-full max-w-6xl p-5">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">Tema te ngjashme</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.tags.length > 0 ? (
            entry.tags.map((tag: (typeof entry.tags)[number]) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="btn-ghost py-2 text-sm">
                #{tag}
              </Link>
            ))
          ) : (
            <p className="muted">Nuk ka etiketa.</p>
          )}
        </div>
      </section>
    </div>
  );
}

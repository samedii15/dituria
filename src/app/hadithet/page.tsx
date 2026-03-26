import Link from "next/link";

import { getHadithBooks } from "@/lib/content";

export default async function HadithBooksPage() {
  const books = await getHadithBooks();

  return (
    <div className="shell space-y-8 py-10">
      <section className="card p-8">
        <h1 className="text-4xl font-semibold text-[var(--primary)]">
          Librat e Hadithit
        </h1>
        <p className="mt-3 max-w-2xl muted">
          Strukture e plote: libra, kapituj dhe hadithe me numer, burim dhe etiketa.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Link key={book.id} href={`/hadithet/${book.slug}`} className="card p-5 transition hover:-translate-y-0.5">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">
              {book.title}
            </h2>
            {'description' in book && book.description ? <p className="mt-2 text-sm muted">{book.description as string}</p> : null}
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--accent)]">
              <span>{book._count.chapters} kapituj</span>
              <span>•</span>
              <span>{book._count.entries} hadithe</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

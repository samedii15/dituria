import Link from "next/link";

import { LiveSearch } from "@/components/LiveSearch";
import { getHomeData } from "@/lib/content";

export default async function HomePage() {
  const { sections, latestEntries, featuredHadith, books } = await getHomeData();

  return (
    <div className="shell space-y-14 py-10">
      <section className="card overflow-visible p-8 sm:p-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <p className="mb-2 text-sm tracking-[0.08em] text-[var(--accent)] uppercase">
              Platforme Diturie
            </p>
            <h1 className="text-4xl leading-tight font-semibold text-[var(--primary)] sm:text-5xl">
              Dituria Islame e Organizuar per Lexim te Qarte
            </h1>
            <div className="gold-line my-5" />
            <p className="max-w-xl text-lg muted">
              Hadithe, lutje, kuran, akide, fikh dhe histori te pejgambereve ne nje sistem modern dhe te menaxhueshem nga admini.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--primary)]">
              Kerko ne te gjitha seksionet
            </p>
            <LiveSearch />
            <Link href="/search" className="inline-block text-sm text-[var(--primary)] underline-offset-2 hover:underline">
              Hape kerkimin e avancuar
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-[var(--primary)]">
            Seksionet Kryesore
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.id} href={section.slug === "hadithet" ? "/hadithet" : `/sections/${section.slug}`} className="card p-5 transition hover:-translate-y-0.5">
              <p className="text-2xl font-semibold text-[var(--primary)]">
                {'name' in section ? section.name : ''}
              </p>
              <p className="mt-2 text-sm muted">{'intro' in section ? section.intro : ''}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-2xl font-semibold text-[var(--primary)]">
            Hadithi i Dites
          </h3>
          {featuredHadith ? (
            <>
              <p className="mt-4 text-lg font-semibold">{featuredHadith.title}</p>
              <p className="mt-2 line-clamp-4 muted">{featuredHadith.content}</p>
              <Link href={`/entries/${featuredHadith.id}`} className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
                Lexo me shume
              </Link>
            </>
          ) : (
            <p className="mt-3 muted">Nuk ka permbajtje ende.</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-2xl font-semibold text-[var(--primary)]">
            Librat e Hadithit
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {books.slice(0, 6).map((book) => (
              <li key={book.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
                <Link href={`/hadithet/${book.slug}`} className="font-semibold text-[var(--primary)] hover:underline">
                  {'title' in book ? book.title : ''}
                </Link>
                <span className="muted">{book._count.entries}</span>
              </li>
            ))}
          </ul>
          <Link href="/hadithet" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
            Shiko te gjitha
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-3xl font-semibold text-[var(--primary)]">
          Publikimet e Fundit
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latestEntries.map((entry) => (
            <Link key={entry.id} href={`/entries/${entry.id}`} className="card p-5">
              <p className="text-xl font-semibold text-[var(--primary)]">
                {entry.title}
              </p>
              <p className="mt-2 line-clamp-3 text-sm muted">{entry.content}</p>
              <p className="mt-3 text-xs text-[var(--accent)]">
                {entry.section?.name}
                {entry.book ? ` • ${entry.book.title}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

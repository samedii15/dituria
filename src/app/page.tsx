import Link from "next/link";

import { LiveSearch } from "@/components/LiveSearch";
import { getHomeData } from "@/lib/content";

export default async function HomePage() {
  const { sections, latestEntries, featuredHadith, books } = await getHomeData();

  return (
    <div className="shell space-y-10 py-6 sm:space-y-14 sm:py-10">
      <section className="card relative p-5 sm:p-10">
        <div className="pointer-events-none absolute -top-10 -right-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(19,75,53,0.2)_0%,_rgba(19,75,53,0)_70%)]" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(185,150,74,0.2)_0%,_rgba(185,150,74,0)_72%)]" />
        <div className="relative grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <p className="eyebrow mb-3">
              Platforme Diturie
            </p>
            <h1 className="text-3xl leading-tight font-semibold text-[var(--primary)] sm:text-5xl">
              Dituria Islame e Organizuar per Lexim te Qarte
            </h1>
            <div className="gold-line my-5" />
            <p className="max-w-xl text-base muted sm:text-lg">
              Hadithe, lutje, kuran, akide, fikh dhe histori te pejgambereve ne nje sistem modern dhe te menaxhueshem nga admini.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:max-w-md">
              <div className="stat-tile">
                <p className="text-2xl font-semibold text-[var(--primary)]">{sections.length}</p>
                <p className="text-xs muted">Seksione</p>
              </div>
              <div className="stat-tile">
                <p className="text-2xl font-semibold text-[var(--primary)]">{books.length}</p>
                <p className="text-xs muted">Libra</p>
              </div>
              <div className="stat-tile">
                <p className="text-2xl font-semibold text-[var(--primary)]">{latestEntries.length}</p>
                <p className="text-xs muted">Publikime</p>
              </div>
            </div>
          </div>

          <div className="glass-panel space-y-3 p-4 sm:p-5">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.id} href={section.slug === "hadithet" ? "/hadithet" : `/sections/${section.slug}`} className="card p-5 transition active:scale-[0.99] hover:-translate-y-0.5">
              <p className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ee] text-sm font-semibold text-[var(--primary)]">
                {('name' in section ? section.name : '?').slice(0, 1)}
              </p>
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
              <p className="mt-4 text-lg font-semibold text-[var(--primary)]">{featuredHadith.title}</p>
              <p className="mt-2 line-clamp-4 muted">{featuredHadith.content}</p>
              <Link href={`/entries/${featuredHadith.id}`} className="mt-4 inline-block py-1 text-sm text-[var(--primary)] hover:underline">
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
                <Link href={`/hadithet/${book.slug}`} className="py-1 font-semibold text-[var(--primary)] hover:underline">
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
            <Link key={entry.id} href={`/entries/${entry.id}`} className="card p-5 active:scale-[0.99]">
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

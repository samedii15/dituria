import { notFound } from "next/navigation";

import { QuranSectionViewer } from "@/components/QuranSectionViewer";
import { SectionEntriesExplorer } from "@/components/SectionEntriesExplorer";
import { getQuranSurahs, getSectionBySlug } from "@/lib/content";

type Params = {
  params: Promise<{ slug: string }>;
};

type SectionCategory = {
  id: string;
  name: string;
};

type SectionEntry = {
  id: string;
  title: string;
  content: string;
  category?: { id: string; name: string } | null;
  book?: { title: string } | null;
};

export default async function SectionPage({ params }: Params) {
  const { slug } = await params;
  const section = await getSectionBySlug(slug);
  const quranSurahs = slug === "kuran" ? await getQuranSurahs() : [];

  if (!section) {
    notFound();
  }

  return (
    <div className="shell space-y-6 py-6 sm:space-y-8 sm:py-10">
      <section className="card p-5 sm:p-8">
        <p className="text-sm uppercase tracking-[0.07em] text-[var(--accent)]">
          Seksion
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
          {'name' in section ? section.name : ''}
        </h1>
        <p className="mt-3 max-w-2xl muted">{'intro' in section ? section.intro : ''}</p>
      </section>

      {slug === "kuran" ? (
        <QuranSectionViewer surahs={quranSurahs} />
      ) : (
        <SectionEntriesExplorer
          categories={section.categories as SectionCategory[]}
          entries={section.entries as SectionEntry[]}
        />
      )}
    </div>
  );
}

import Link from "next/link";

import { canAttemptDatabase, clearDatabaseUnavailable, markDatabaseUnavailable, shouldSkipDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let sections = 0;
  let categories = 0;
  let books = 0;
  let chapters = 0;
  let entries = 0;
  let published = 0;

  if (!shouldSkipDatabase() && (await canAttemptDatabase())) {
    try {
      [sections, categories, books, chapters, entries, published] = await Promise.all([
        prisma.section.count(),
        prisma.category.count(),
        prisma.hadithBook.count(),
        prisma.hadithChapter.count(),
        prisma.entry.count(),
        prisma.entry.count({ where: { isPublished: true } }),
      ]);
      clearDatabaseUnavailable();
    } catch {
      markDatabaseUnavailable();
    }
  }

  const cards = [
    ["Seksione", sections],
    ["Kategori", categories],
    ["Librat e Hadithit", books],
    ["Kapitujt e Hadithit", chapters],
    ["Artikuj", entries],
    ["Te Publikuara", published],
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-semibold text-[var(--primary)]">Permbledhja e Panelit</h1>
      <p className="muted">
        Ketu sheh gjendjen e permbajtjes dhe veprimet e shpejta per menaxhim.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm muted">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">Veprime te Shpejta</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="btn-primary" href="/admin/entries/new">Krijo Artikull</Link>
          <Link className="btn-ghost" href="/admin/entries">Menaxho Artikujt</Link>
          <Link className="btn-ghost" href="/admin/structure">Menaxho Strukturen</Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

import { AdminEntriesTable } from "@/components/admin/AdminEntriesTable";
import { canAttemptDatabase, clearDatabaseUnavailable, markDatabaseUnavailable, shouldSkipDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEntriesPage() {
  let entries: Array<{
    id: string;
    title: string;
    isPublished: boolean;
    section: { name: string } | null;
    book: { title: string } | null;
  }> = [];

  if (!shouldSkipDatabase() && (await canAttemptDatabase())) {
    try {
      entries = await prisma.entry.findMany({
        include: {
          section: true,
          book: true,
          chapter: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 300,
      });
      clearDatabaseUnavailable();
    } catch {
      markDatabaseUnavailable();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-[var(--primary)]">Artikujt</h1>
        <Link className="btn-primary" href="/admin/entries/new">
          Artikull i Ri
        </Link>
      </div>

      <AdminEntriesTable initialEntries={entries} />
    </div>
  );
}

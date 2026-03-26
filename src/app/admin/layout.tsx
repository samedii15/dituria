import Link from "next/link";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell grid gap-6 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="card h-fit p-4">
        <p className="text-2xl font-semibold text-[var(--primary)]">Paneli Admin</p>
        <p className="mt-1 text-xs muted">Menaxhimi i permbajtjes ne shqip</p>
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[#f9f6ee] p-3 text-xs">
          <p className="font-semibold text-[var(--primary)]">Nga ta fillosh:</p>
          <ol className="mt-1 list-decimal space-y-1 pl-4 muted">
            <li>Hape &quot;Artikull i Ri&quot; per shtim te shpejte.</li>
            <li>Per ndryshim/fshirje, perdor &quot;Artikujt&quot;.</li>
            <li>Per seksione/libra, perdor &quot;Seksione / Libra / Kategori&quot;.</li>
          </ol>
        </div>
        <nav className="mt-3 space-y-2 text-sm">
          <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-[#f4efe2]">
            Permbledhje
          </Link>
          <Link href="/admin/entries" className="block rounded-lg px-3 py-2 hover:bg-[#f4efe2]">
            Artikujt
          </Link>
          <Link href="/admin/entries/new" className="block rounded-lg px-3 py-2 hover:bg-[#f4efe2]">
            Artikull i Ri
          </Link>
          <Link href="/admin/structure" className="block rounded-lg px-3 py-2 hover:bg-[#f4efe2]">
            Struktura
          </Link>
          <Link href="/admin/quran" className="block rounded-lg px-3 py-2 hover:bg-[#f4efe2]">
            Kuran
          </Link>
        </nav>
        <div className="mt-4">
          <AdminLogoutButton />
        </div>
      </aside>

      <section>{children}</section>
    </div>
  );
}

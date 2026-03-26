"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type EntryRow = {
  id: string;
  title: string;
  isPublished: boolean;
  section: { name: string } | null;
  book: { title: string } | null;
  updatedAt?: string;
};

export function AdminEntriesTable({
  initialEntries,
}: {
  initialEntries: EntryRow[];
}) {
  const [entries, setEntries] = useState<EntryRow[]>(initialEntries);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return entries;
    }

    return entries.filter((entry) => {
      const haystack = [
        entry.title,
        entry.section?.name || "",
        entry.book?.title || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [entries, query]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("A je i sigurt qe deshiron ta fshish kete artikull?");

    if (!confirmed) {
      return;
    }

    setBusyId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/entries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setMessage("Fshirja deshtoi.");
        return;
      }

      setEntries((prev) => prev.filter((item) => item.id !== id));
      setMessage("Artikulli u fshi.");
    } catch {
      setMessage("Fshirja deshtoi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[#fdf9ef] p-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kerko sipas titullit, seksionit ose librit..."
          className="h-10 min-w-[230px] flex-1 rounded-xl border border-[var(--border)] bg-white px-3"
        />
        <p className="text-sm muted">{filtered.length} artikuj</p>
      </div>

      {message ? <p className="border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--primary)]">{message}</p> : null}

      <div className="md:hidden">
        <div className="space-y-3 p-3">
          {filtered.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="font-semibold">{entry.title}</p>
              <p className="mt-1 text-xs muted">Seksioni: {entry.section?.name || "-"}</p>
              <p className="text-xs muted">Libri: {entry.book?.title || "-"}</p>
              <p className="mt-1 text-xs text-[var(--accent)]">{entry.isPublished ? "Publikuar" : "Draft"}</p>
              <div className="mt-3 flex gap-2">
                <Link className="btn-ghost py-1" href={`/admin/entries/${entry.id}`}>
                  Ndrysho
                </Link>
                <button
                  className="btn-ghost py-1"
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  disabled={busyId === entry.id}
                >
                  {busyId === entry.id ? "Duke fshire..." : "Fshi"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f6f2e8] text-[var(--primary)]">
            <tr>
              <th className="px-4 py-3">Titulli</th>
              <th className="px-4 py-3">Seksioni</th>
              <th className="px-4 py-3">Libri</th>
              <th className="px-4 py-3">Statusi</th>
              <th className="px-4 py-3">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold">{entry.title}</td>
                <td className="px-4 py-3">{entry.section?.name || "-"}</td>
                <td className="px-4 py-3">{entry.book?.title || "-"}</td>
                <td className="px-4 py-3">{entry.isPublished ? "Publikuar" : "Draft"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="btn-ghost py-1" href={`/admin/entries/${entry.id}`}>
                      Ndrysho
                    </Link>
                    <button
                      className="btn-ghost py-1"
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={busyId === entry.id}
                    >
                      {busyId === entry.id ? "Duke fshire..." : "Fshi"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm muted">
          <p>Nuk u gjet asnje artikull.</p>
          <p className="mt-1">Per te filluar, kliko &quot;Artikull i Ri&quot; dhe ruaje fillimisht si draft.</p>
        </div>
      ) : null}
    </div>
  );
}

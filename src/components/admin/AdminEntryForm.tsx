"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MetaState = {
  sections: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; sectionId: string; name: string }>;
  books: Array<{ id: string; title: string }>;
  chapters: Array<{ id: string; bookId: string; title: string }>;
};

type EntryFormState = {
  sectionId: string;
  categoryId: string;
  bookId: string;
  chapterId: string;
  title: string;
  content: string;
  arabicText: string;
  hadithNumber: string;
  source: string;
  tags: string;
  isPublished: boolean;
};

type DuplicateEntry = {
  id: string;
  title: string;
};

const EMPTY: EntryFormState = {
  sectionId: "",
  categoryId: "",
  bookId: "",
  chapterId: "",
  title: "",
  content: "",
  arabicText: "",
  hadithNumber: "",
  source: "",
  tags: "",
  isPublished: false,
};

export function AdminEntryForm({ mode, entryId }: { mode: "create" | "edit"; entryId?: string }) {
  const router = useRouter();
  const [meta, setMeta] = useState<MetaState>({ sections: [], categories: [], books: [], chapters: [] });
  const [form, setForm] = useState<EntryFormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateEntry[] | null>(null);

  const selectedSection = useMemo(
    () => meta.sections.find((s) => s.id === form.sectionId),
    [meta.sections, form.sectionId],
  );

  const isHadith = selectedSection?.slug === "hadithet";

  const visibleCategories = useMemo(
    () => meta.categories.filter((c) => c.sectionId === form.sectionId),
    [meta.categories, form.sectionId],
  );

  const visibleChapters = useMemo(
    () => meta.chapters.filter((c) => c.bookId === form.bookId),
    [meta.chapters, form.bookId],
  );

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);

      const metaResponse = await fetch("/api/admin/meta");
      if (metaResponse.ok) {
        const data = await metaResponse.json();
        setMeta({
          sections: data.sections || [],
          categories: data.categories || [],
          books: data.books || [],
          chapters: data.chapters || [],
        });
      }

      if (mode === "edit" && entryId) {
        const entryResponse = await fetch(`/api/admin/entries/${entryId}`);
        if (entryResponse.ok) {
          const payload = await entryResponse.json();
          const entry = payload.entry;
          setForm({
            sectionId: entry.sectionId || "",
            categoryId: entry.categoryId || "",
            bookId: entry.bookId || "",
            chapterId: entry.chapterId || "",
            title: entry.title || "",
            content: entry.content || "",
            arabicText: entry.arabicText || "",
            hadithNumber: entry.hadithNumber || "",
            source: entry.source || "",
            tags: Array.isArray(entry.tags) ? entry.tags.join(", ") : "",
            isPublished: Boolean(entry.isPublished),
          });
        }
      }

      setLoading(false);
    }

    void bootstrap();
  }, [mode, entryId]);

  function setValue<K extends keyof EntryFormState>(key: K, value: EntryFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string[] {
    const issues: string[] = [];
    if (!form.sectionId) issues.push("Zgjidh seksionin.");
    if (form.title.trim().length < 2) issues.push("Titulli duhet te kete te pakten 2 karaktere.");
    if (form.content.trim().length < 10) issues.push("Permbajtja duhet te kete te pakten 10 karaktere.");
    if (isHadith && !form.bookId) issues.push("Per hadithet, zgjidh librin.");
    if (isHadith && !form.chapterId) issues.push("Per hadithet, zgjidh kapitullin.");
    if (isHadith && !form.hadithNumber.trim()) issues.push("Per hadithet, vendos numrin e hadithit.");
    return issues;
  }

  async function submit(forceSave = false) {
    setSaving(true);
    setError(null);
    setFieldErrors([]);

    const issues = validate();
    if (issues.length > 0) {
      setFieldErrors(issues);
      setSaving(false);
      return;
    }

    const payload = {
      sectionId: form.sectionId,
      categoryId: !isHadith ? form.categoryId || null : null,
      bookId: isHadith ? form.bookId || null : null,
      chapterId: isHadith ? form.chapterId || null : null,
      title: form.title,
      content: form.content,
      arabicText: form.arabicText || null,
      hadithNumber: isHadith ? form.hadithNumber || null : null,
      source: form.source || null,
      tags: form.tags,
      isPublished: form.isPublished,
      forceSave,
    };

    const url = mode === "create" ? "/api/admin/entries" : `/api/admin/entries/${entryId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 409) {
      setDuplicates(data.duplicates || []);
      setSaving(false);
      return;
    }

    if (!response.ok) {
      setError(data.error || "Ruajtja deshtoi.");
      setSaving(false);
      return;
    }

    router.push("/admin/entries");
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(false);
  }

  if (loading) {
    return <div className="card p-5">Duke ngarkuar formen...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--primary)]">{mode === "create" ? "Artikull i ri" : "Ndrysho artikullin"}</h1>
        <p className="muted">Forme e thjeshte per shtim te shpejte te haditheve, lutjeve dhe artikujve.</p>
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {fieldErrors.length > 0 ? (
        <ul className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {fieldErrors.map((issue) => (
            <li key={issue}>- {issue}</li>
          ))}
        </ul>
      ) : null}

      {duplicates ? (
        <div className="rounded-xl border border-[var(--border)] bg-[#fffaf0] p-4">
          <p className="font-semibold text-[var(--primary)]">Kjo permbajtje ekziston tashme.</p>
          <ul className="mt-2 space-y-1 text-sm muted">
            {duplicates.map((d) => (
              <li key={d.id}>{d.title}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary" type="button" onClick={() => void submit(true)} disabled={saving}>Vazhdo</button>
            <button className="btn-ghost" type="button" onClick={() => setDuplicates(null)} disabled={saving}>Anulo</button>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="card space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Seksioni</span>
            <select className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.sectionId} onChange={(e) => {
              const sectionId = e.target.value;
              setForm((prev) => ({ ...prev, sectionId, categoryId: "", bookId: "", chapterId: "", hadithNumber: "" }));
            }} required>
              <option value="">Zgjidh seksionin</option>
              {meta.sections.map((section) => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </label>

          {!isHadith ? (
            <label className="space-y-1 text-sm">
              <span>Kategoria</span>
              <select className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.categoryId} onChange={(e) => setValue("categoryId", e.target.value)}>
                <option value="">Pa kategori</option>
                {visibleCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="space-y-1 text-sm">
              <span>Libri i hadithit</span>
              <select className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.bookId} onChange={(e) => {
                const bookId = e.target.value;
                setForm((prev) => ({ ...prev, bookId, chapterId: "" }));
              }} required>
                <option value="">Zgjidh librin</option>
                {meta.books.map((book) => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {isHadith ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Kapitulli</span>
              <select className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.chapterId} onChange={(e) => setValue("chapterId", e.target.value)} required>
                <option value="">Zgjidh kapitullin</option>
                {visibleChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Numri i hadithit</span>
              <input className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.hadithNumber} onChange={(e) => setValue("hadithNumber", e.target.value)} placeholder="p.sh. 1" required />
            </label>
          </div>
        ) : null}

        <label className="space-y-1 text-sm">
          <span>Titulli</span>
          <input className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.title} onChange={(e) => setValue("title", e.target.value)} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>Teksti</span>
          <textarea className="min-h-40 w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.content} onChange={(e) => setValue("content", e.target.value)} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>Teksti arabisht (opsional)</span>
          <textarea dir="rtl" className="min-h-24 w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.arabicText} onChange={(e) => setValue("arabicText", e.target.value)} />
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Burimi</span>
            <input className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.source} onChange={(e) => setValue("source", e.target.value)} placeholder="p.sh. Buhari" />
          </label>

          <label className="space-y-1 text-sm">
            <span>Etiketat</span>
            <input className="w-full rounded-xl border border-[var(--border)] px-3 py-2" value={form.tags} onChange={(e) => setValue("tags", e.target.value)} placeholder="lutje, mengjes" />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setValue("isPublished", e.target.checked)} />
          Publiko menjehere
        </label>

        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Duke ruajtur..." : "Ruaj"}</button>
          <button className="btn-ghost" type="button" onClick={() => {
            router.push("/admin/entries");
          }} disabled={saving}>Anulo</button>
        </div>
      </form>
    </div>
  );
}

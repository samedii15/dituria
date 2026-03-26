"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Section = { id: string; name: string; slug: string };
type Category = { id: string; name: string; slug: string; sectionId: string };
type Book = { id: string; title: string; slug: string };
type Chapter = { id: string; title: string; slug: string; bookId: string; order: number };

export function AdminStructureManager() {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const hadithSection = useMemo(() => sections.find((s) => s.slug === "hadithet"), [sections]);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function loadAll() {
    const [sectionRes, categoryRes, bookRes, chapterRes] = await Promise.all([
      fetch("/api/admin/sections"),
      fetch("/api/admin/categories"),
      fetch("/api/admin/books"),
      fetch("/api/admin/chapters"),
    ]);

    if (sectionRes.ok) setSections((await sectionRes.json()).sections || []);
    if (categoryRes.ok) setCategories((await categoryRes.json()).categories || []);
    if (bookRes.ok) setBooks((await bookRes.json()).books || []);
    if (chapterRes.ok) setChapters((await chapterRes.json()).chapters || []);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function submitForm(event: FormEvent<HTMLFormElement>, endpoint: string) {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;

    setBusy(true);
    setMessage("");

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries()) as Record<string, string>;

      if (typeof payload.order === "string") {
        payload.order = String(Number(payload.order || "0"));
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          order: payload.order ? Number(payload.order) : undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error || "Ruajtja deshtoi.");
        return;
      }

      setMessage("U ruajt me sukses.");
      form.reset();
      await loadAll();
    } catch {
      setMessage("Ruajtja deshtoi.");
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(endpoint: string) {
    if (busy) return;
    if (!window.confirm("A je i sigurt qe deshiron ta fshish kete element?")) return;

    setBusy(true);
    const response = await fetch(endpoint, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Fshirja deshtoi.");
      setBusy(false);
      return;
    }

    setMessage("U fshi me sukses.");
    await loadAll();
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-[var(--primary)]">{message}</p> : null}

      <section className="card p-4 text-sm">
        <p className="font-semibold text-[var(--primary)]">Udhezim i shkurter</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 muted">
          <li>Shto seksionet baze: hadithet, lutjet, fikh, akide, kuran.</li>
          <li>Shto kategori per lutje/fikh/akide.</li>
          <li>Per hadithet: shto libra dhe pastaj kapituj.</li>
        </ul>
      </section>

      <details className="card p-5" open>
        <summary className="cursor-pointer list-none text-2xl font-semibold text-[var(--primary)]">Seksionet</summary>
        <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={(e) => submitForm(e, "/api/admin/sections")}>
          <input name="name" placeholder="Emri i seksionit" className="rounded-xl border border-[var(--border)] px-3 py-2" required onBlur={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;
            const slug = form.querySelector<HTMLInputElement>("input[name='slug']");
            if (slug && !slug.value.trim()) slug.value = slugify(e.currentTarget.value);
          }} />
          <input name="slug" placeholder="slug" className="rounded-xl border border-[var(--border)] px-3 py-2" required />
          <input name="intro" placeholder="Pershkrim i shkurter" className="rounded-xl border border-[var(--border)] px-3 py-2" />
          <button className="btn-primary" disabled={busy}>{busy ? "Duke ruajtur..." : "Shto"}</button>
        </form>
        <ul className="mt-3 space-y-2 text-sm">
          {sections.map((section) => (
            <li key={section.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
              <span>{section.name} ({section.slug})</span>
              <button className="btn-ghost py-1" onClick={() => removeItem(`/api/admin/sections/${section.id}`)} disabled={busy} type="button">Fshi</button>
            </li>
          ))}
        </ul>
      </details>

      <details className="card p-5" open>
        <summary className="cursor-pointer list-none text-2xl font-semibold text-[var(--primary)]">Kategorite</summary>
        <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={(e) => submitForm(e, "/api/admin/categories")}>
          <select name="sectionId" className="rounded-xl border border-[var(--border)] px-3 py-2" required>
            <option value="">Zgjidh seksionin</option>
            {sections.filter((s) => s.slug !== "hadithet" && s.slug !== "kuran").map((section) => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
          <input name="name" placeholder="Emri i kategorise" className="rounded-xl border border-[var(--border)] px-3 py-2" required onBlur={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;
            const slug = form.querySelector<HTMLInputElement>("input[name='slug']");
            if (slug && !slug.value.trim()) slug.value = slugify(e.currentTarget.value);
          }} />
          <input name="slug" placeholder="slug" className="rounded-xl border border-[var(--border)] px-3 py-2" required />
          <button className="btn-primary" disabled={busy}>{busy ? "Duke ruajtur..." : "Shto"}</button>
        </form>
        <ul className="mt-3 space-y-2 text-sm">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
              <span>{category.name} ({category.slug})</span>
              <button className="btn-ghost py-1" onClick={() => removeItem(`/api/admin/categories/${category.id}`)} disabled={busy} type="button">Fshi</button>
            </li>
          ))}
        </ul>
      </details>

      <details className="card p-5" open>
        <summary className="cursor-pointer list-none text-2xl font-semibold text-[var(--primary)]">Librat e Hadithit</summary>
        <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={(e) => submitForm(e, "/api/admin/books")}>
          <input name="title" placeholder="Titulli i librit" className="rounded-xl border border-[var(--border)] px-3 py-2" required onBlur={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;
            const slug = form.querySelector<HTMLInputElement>("input[name='slug']");
            if (slug && !slug.value.trim()) slug.value = slugify(e.currentTarget.value);
          }} />
          <input name="slug" placeholder="slug" className="rounded-xl border border-[var(--border)] px-3 py-2" required />
          <input name="description" placeholder="Pershkrim (opsional)" className="rounded-xl border border-[var(--border)] px-3 py-2" />
          <button className="btn-primary" disabled={busy}>{busy ? "Duke ruajtur..." : "Shto"}</button>
        </form>
        <ul className="mt-3 space-y-2 text-sm">
          {books.map((book) => (
            <li key={book.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
              <span>{book.title} ({book.slug})</span>
              <button className="btn-ghost py-1" onClick={() => removeItem(`/api/admin/books/${book.id}`)} disabled={busy} type="button">Fshi</button>
            </li>
          ))}
        </ul>
      </details>

      <details className="card p-5" open>
        <summary className="cursor-pointer list-none text-2xl font-semibold text-[var(--primary)]">Kapitujt e Hadithit</summary>
        <form className="mt-3 grid gap-2 md:grid-cols-5" onSubmit={(e) => submitForm(e, "/api/admin/chapters")}>
          <select name="bookId" className="rounded-xl border border-[var(--border)] px-3 py-2" required>
            <option value="">Zgjidh librin</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>{book.title}</option>
            ))}
          </select>
          <input name="title" placeholder="Titulli i kapitullit" className="rounded-xl border border-[var(--border)] px-3 py-2" required onBlur={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;
            const slug = form.querySelector<HTMLInputElement>("input[name='slug']");
            if (slug && !slug.value.trim()) slug.value = slugify(e.currentTarget.value);
          }} />
          <input name="slug" placeholder="slug" className="rounded-xl border border-[var(--border)] px-3 py-2" required />
          <input name="order" type="number" defaultValue={0} className="rounded-xl border border-[var(--border)] px-3 py-2" />
          <button className="btn-primary" disabled={busy}>{busy ? "Duke ruajtur..." : "Shto"}</button>
        </form>
        <ul className="mt-3 space-y-2 text-sm">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
              <span>{chapter.title} ({chapter.slug})</span>
              <button className="btn-ghost py-1" onClick={() => removeItem(`/api/admin/chapters/${chapter.id}`)} disabled={busy} type="button">Fshi</button>
            </li>
          ))}
        </ul>
      </details>

      {!hadithSection ? <p className="text-sm text-amber-700">Keshille: krijo seksionin me slug &quot;hadithet&quot; qe hyrja e haditheve te jete me e drejteperdrejte.</p> : null}
    </div>
  );
}

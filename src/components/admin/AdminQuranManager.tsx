"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { buildAyahsFromFullSurah } from "@/lib/quran";

type Ayah = {
  id: string;
  surahId: string;
  number: number;
  arabicText: string | null;
  text: string;
};

type Surah = {
  id: string;
  name: string;
  number: number;
  ayahs?: Ayah[];
};

export function AdminQuranManager() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [activeSurah, setActiveSurah] = useState<Surah | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"normal" | "full">("normal");
  const [fullArabicText, setFullArabicText] = useState("");
  const [fullAlbanianText, setFullAlbanianText] = useState("");
  const [editingAyahId, setEditingAyahId] = useState<string | null>(null);

  const fullSurahPreview = useMemo(() => {
    if (!fullArabicText.trim() && !fullAlbanianText.trim()) {
      return { ayahs: [], error: "" };
    }

    try {
      const ayahs = buildAyahsFromFullSurah(fullArabicText, fullAlbanianText);
      return { ayahs, error: "" };
    } catch (error) {
      return {
        ayahs: [],
        error: error instanceof Error ? error.message : "Gabim ne validim.",
      };
    }
  }, [fullArabicText, fullAlbanianText]);

  async function loadSurahs() {
    const res = await fetch("/api/admin/surahs");
    const data = await res.json().catch(() => ({ surahs: [] }));
    setSurahs(data.surahs || []);
  }

  async function openSurah(id: string) {
    const res = await fetch(`/api/admin/surahs/${id}`);
    const data = await res.json().catch(() => ({}));
    if (data.surah) setActiveSurah(data.surah);
  }

  function prefillFullSurahFromCurrent() {
    if (!activeSurah) return;

    const ayahs = activeSurah.ayahs || [];
    setFullArabicText(ayahs.map((ayah) => ayah.arabicText || "").join("\n"));
    setFullAlbanianText(ayahs.map((ayah) => ayah.text).join("\n"));
    setMode("full");
    setMessage("");
  }

  useEffect(() => {
    let disposed = false;

    async function initialLoad() {
      const res = await fetch("/api/admin/surahs");
      const data = await res.json().catch(() => ({ surahs: [] }));
      if (!disposed) {
        setSurahs(data.surahs || []);
      }
    }

    void initialLoad();

    return () => {
      disposed = true;
    };
  }, []);

  async function handleAddSurah(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    const fd = new FormData(event.currentTarget);
    const payload = {
      number: Number(fd.get("number")),
      name: String(fd.get("name") || "").trim(),
    };

    const res = await fetch("/api/admin/surahs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage("Ruajtja e sures deshtoi.");
      setBusy(false);
      return;
    }

    event.currentTarget.reset();
    setMessage("Sura u shtua.");
    await loadSurahs();
    setBusy(false);
  }

  async function handleDeleteSurah(id: string) {
    if (busy) return;
    if (!window.confirm("A je i sigurt qe deshiron ta fshish kete sure?")) return;

    setBusy(true);
    const res = await fetch(`/api/admin/surahs/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setMessage("Fshirja e sures deshtoi.");
      setBusy(false);
      return;
    }

    if (activeSurah?.id === id) setActiveSurah(null);
    setMessage("Sura u fshi.");
    await loadSurahs();
    setBusy(false);
  }

  async function handleAddAyah(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeSurah || busy) return;

    setBusy(true);
    setMessage("");

    const fd = new FormData(event.currentTarget);
    const payload = {
      surahId: activeSurah.id,
      number: Number(fd.get("number")),
      arabicText: String(fd.get("arabicText") || "").trim() || null,
      text: String(fd.get("text") || "").trim(),
    };

    const res = await fetch("/api/admin/ayahs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage("Ruajtja e ajetit deshtoi.");
      setBusy(false);
      return;
    }

    event.currentTarget.reset();
    setMessage("Ajeti u shtua.");
    await openSurah(activeSurah.id);
    setBusy(false);
  }

  async function handleDeleteAyah(id: string) {
    if (!activeSurah || busy) return;
    if (!window.confirm("A je i sigurt qe deshiron ta fshish kete ajet?")) return;

    setBusy(true);
    const res = await fetch(`/api/admin/ayahs/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setMessage("Fshirja e ajetit deshtoi.");
      setBusy(false);
      return;
    }

    setMessage("Ajeti u fshi.");
    await openSurah(activeSurah.id);
    setBusy(false);
  }

  async function handleUpdateAyah(ayah: Ayah, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeSurah || busy) return;

    const fd = new FormData(event.currentTarget);
    const payload = {
      surahId: activeSurah.id,
      number: Number(fd.get("number")),
      arabicText: String(fd.get("arabicText") || "").trim() || null,
      text: String(fd.get("text") || "").trim(),
    };

    setBusy(true);
    const res = await fetch(`/api/admin/ayahs/${ayah.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage("Perditesimi i ajetit deshtoi.");
      setBusy(false);
      return;
    }

    setEditingAyahId(null);
    setMessage("Ajeti u perditesua.");
    await openSurah(activeSurah.id);
    setBusy(false);
  }

  async function handleSaveFullSurah(modeLabel: "save" | "rebuild") {
    if (!activeSurah || busy) return;

    if (fullSurahPreview.error) {
      setMessage(fullSurahPreview.error);
      return;
    }

    if (fullSurahPreview.ayahs.length === 0) {
      setMessage("Nuk u gjet asnje ajet i vlefshem.");
      return;
    }

    if (modeLabel === "rebuild") {
      const confirmed = window.confirm("Do te rindertohen te gjitha ajetet nga ky tekst. Vazhdon?");
      if (!confirmed) return;
    }

    setBusy(true);
    setMessage("");

    const res = await fetch(`/api/admin/surahs/${activeSurah.id}/full-text`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        arabicText: fullArabicText,
        albanianText: fullAlbanianText,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMessage(data.error || "Ruajtja e sures se plote deshtoi.");
      setBusy(false);
      return;
    }

    setMessage(modeLabel === "rebuild" ? "Ajetet u rindertuan me sukses." : "Sura u ruajt dhe u nda ne ajete.");
    await openSurah(activeSurah.id);
    setBusy(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="card p-4">
        <h1 className="text-2xl font-semibold text-[var(--primary)]">Kuran: Suret</h1>
        <p className="mt-1 text-sm muted">Shto sure dhe kliko nje sure per te menaxhuar ajetet.</p>

        <form className="mt-4 space-y-2" onSubmit={handleAddSurah}>
          <input name="number" type="number" min={1} max={114} required className="w-full rounded-xl border border-[var(--border)] px-3 py-2" placeholder="Numri i sures" />
          <input name="name" required className="w-full rounded-xl border border-[var(--border)] px-3 py-2" placeholder="Emri i sures" />
          <button className="btn-primary w-full" type="submit" disabled={busy}>{busy ? "Duke ruajtur..." : "Shto sure"}</button>
        </form>

        <div className="mt-4 space-y-2">
          {surahs.map((surah) => (
            <div key={surah.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${activeSurah?.id === surah.id ? "border-[var(--primary)] bg-[#eef5f1]" : "border-[var(--border)]"}`}>
              <button className="text-left" type="button" onClick={() => void openSurah(surah.id)}>
                {surah.number}. {surah.name}
              </button>
              <button className="btn-ghost py-1" type="button" onClick={() => void handleDeleteSurah(surah.id)} disabled={busy}>Fshi</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-4">
        {!activeSurah ? (
          <p className="muted">Zgjidh nje sure nga lista majtas.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl font-semibold text-[var(--primary)]">{activeSurah.number}. {activeSurah.name}</h2>
              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost py-1" type="button" onClick={() => setMode("normal")}>Shto ajet vecmas</button>
                <button className="btn-ghost py-1" type="button" onClick={() => {
                  setMode("full");
                  setFullArabicText("");
                  setFullAlbanianText("");
                  setMessage("");
                }}>Ngjit suren e plote</button>
                <button className="btn-ghost py-1" type="button" onClick={prefillFullSurahFromCurrent}>Edit full surah</button>
              </div>
            </div>

            {message ? <p className="mt-2 text-sm text-[var(--primary)]">{message}</p> : null}

            {mode === "full" ? (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[#fffaf0] p-4">
                <p className="text-sm font-semibold text-[var(--primary)]">Menyra e shpejte: Paste full surah</p>
                <p className="mt-1 text-xs muted">
                  Vendos nje ajet per rresht ne arabisht dhe nje perkthim per rresht ne shqip. Sistemi i ndan automatikisht sipas rendit.
                </p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">Teksti arabisht i plote</span>
                    <textarea
                      className="min-h-48 w-full rounded-xl border border-[var(--border)] px-3 py-2"
                      dir="rtl"
                      value={fullArabicText}
                      onChange={(e) => setFullArabicText(e.target.value)}
                      placeholder="Ajeti 1\nAjeti 2\nAjeti 3"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">Perkthimi shqip i plote</span>
                    <textarea
                      className="min-h-48 w-full rounded-xl border border-[var(--border)] px-3 py-2"
                      value={fullAlbanianText}
                      onChange={(e) => setFullAlbanianText(e.target.value)}
                      placeholder="Perkthimi i ajetit 1\nPerkthimi i ajetit 2\nPerkthimi i ajetit 3"
                    />
                  </label>
                </div>

                {fullSurahPreview.error ? (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{fullSurahPreview.error}</p>
                ) : null}

                {!fullSurahPreview.error && fullSurahPreview.ayahs.length > 0 ? (
                  <div className="mt-3 rounded-xl border border-[var(--border)] bg-white p-3">
                    <p className="text-sm font-semibold text-[var(--primary)]">Preview ({fullSurahPreview.ayahs.length} ajete)</p>
                    <div className="mt-2 max-h-56 space-y-2 overflow-auto text-sm">
                      {fullSurahPreview.ayahs.map((ayah) => (
                        <div key={ayah.number} className="rounded-lg border border-[var(--border)] px-2 py-1">
                          <p className="text-xs font-semibold text-[var(--accent)]">Ajeti {ayah.number}</p>
                          <p className="text-right" dir="rtl">{ayah.arabicText}</p>
                          <p>{ayah.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => void handleSaveFullSurah("save")}
                    disabled={busy || !!fullSurahPreview.error || fullSurahPreview.ayahs.length === 0}
                  >
                    {busy ? "Duke ruajtur..." : "Ruaj dhe ndaj automatikisht ne ajete"}
                  </button>
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() => void handleSaveFullSurah("rebuild")}
                    disabled={busy || !!fullSurahPreview.error || fullSurahPreview.ayahs.length === 0}
                  >
                    Rebuild ayahs from full text
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-4 grid gap-2 rounded-xl border border-[var(--border)] bg-[#f9f6ee] p-3 md:grid-cols-12" onSubmit={handleAddAyah}>
                <input name="number" type="number" min={1} required className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-2" placeholder="Nr." />
                <input name="arabicText" className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-10" dir="rtl" placeholder="Teksti arabisht (opsional)" />
                <textarea name="text" required className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-10" placeholder="Perkthimi shqip" />
                <button className="btn-primary md:col-span-2" type="submit" disabled={busy}>{busy ? "Duke ruajtur..." : "Shto"}</button>
              </form>
            )}

            <div className="mt-4 space-y-3">
              {(activeSurah.ayahs || []).map((ayah) => (
                <div key={ayah.id} className="rounded-xl border border-[var(--border)] p-3">
                  {editingAyahId === ayah.id ? (
                    <form className="space-y-2" onSubmit={(e) => void handleUpdateAyah(ayah, e)}>
                      <input name="number" defaultValue={ayah.number} type="number" min={1} className="w-24 rounded-xl border border-[var(--border)] px-3 py-2" required />
                      <textarea name="arabicText" dir="rtl" defaultValue={ayah.arabicText || ""} className="w-full rounded-xl border border-[var(--border)] px-3 py-2" />
                      <textarea name="text" defaultValue={ayah.text} className="w-full rounded-xl border border-[var(--border)] px-3 py-2" required />
                      <div className="flex gap-2">
                        <button className="btn-primary" type="submit" disabled={busy}>Ruaj</button>
                        <button className="btn-ghost" type="button" onClick={() => setEditingAyahId(null)} disabled={busy}>Anulo</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--primary)]">Ajeti {ayah.number}</p>
                        <div className="flex gap-2">
                          <button className="btn-ghost py-1" type="button" onClick={() => setEditingAyahId(ayah.id)} disabled={busy}>Edito</button>
                          <button className="btn-ghost py-1" type="button" onClick={() => void handleDeleteAyah(ayah.id)} disabled={busy}>Fshi</button>
                        </div>
                      </div>
                      {ayah.arabicText ? <p className="mt-2 text-right text-lg" dir="rtl">{ayah.arabicText}</p> : null}
                      <p className="mt-2">{ayah.text}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

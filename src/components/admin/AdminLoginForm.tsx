"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Hyrja deshtoi");
        return;
      }

      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md space-y-4 p-6">
      <h1 className="text-3xl font-semibold text-[var(--primary)]">Hyrje ne Panelin Admin</h1>
      <p className="text-sm muted">Menaxho permbajtjen islame, librat dhe kapitujt.</p>

      <label className="block">
        <span className="mb-1 block text-sm">Perdoruesi</span>
        <input
          className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm">Fjalekalimi</span>
        <input
          type="password"
          className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? "Duke hyre..." : "Hyr"}
      </button>
    </form>
  );
}

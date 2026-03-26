"use client";

import Link from "next/link";
import { useState } from "react";

const nav = [
  { href: "/hadithet", label: "Hadithet" },
  { href: "/sections/lutjet", label: "Lutjet" },
  { href: "/sections/kuran", label: "Kuran" },
  { href: "/sections/historite-e-pejgambereve", label: "Historite" },
  { href: "/sections/akide", label: "Akide" },
  { href: "/sections/fikh", label: "Fikh" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#fffdf7]/95 backdrop-blur">
      <div className="shell flex items-center justify-between gap-3 py-4">
        <Link href="/" className="text-2xl font-semibold text-[var(--primary)]">
          islam.al
        </Link>

        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-[var(--muted)] hover:text-[var(--primary)]">
              {item.label}
            </Link>
          ))}
          <Link href="/search" className="btn-ghost py-2">
            Kerko
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/search" className="btn-ghost py-2" onClick={handleClose}>
            Kerko
          </Link>
          <button
            type="button"
            className="btn-ghost py-2"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsOpen((current) => !current)}
          >
            Menu
          </button>
        </div>
      </div>

      {isOpen ? (
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[#fffdf7] lg:hidden">
          <div className="shell grid gap-2 py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--primary)]"
                onClick={handleClose}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}


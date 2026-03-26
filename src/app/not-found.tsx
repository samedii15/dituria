import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell py-20 text-center">
      <h1 className="text-5xl font-semibold text-[var(--primary)]">404</h1>
      <p className="mt-3 muted">The requested content could not be found.</p>
      <Link href="/" className="btn-primary mt-6 inline-block">
        Back to home
      </Link>
    </div>
  );
}

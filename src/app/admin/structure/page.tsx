import { AdminStructureManager } from "@/components/admin/AdminStructureManager";

export default function AdminStructurePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-semibold text-[var(--primary)]">Struktura dhe Taksonomia</h1>
      <p className="muted">Menaxho seksionet, kategorite, librat dhe kapitujt e hadithit.</p>
      <AdminStructureManager />
    </div>
  );
}

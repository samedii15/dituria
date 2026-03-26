import { AdminEntryForm } from "@/components/admin/AdminEntryForm";
import { Suspense } from "react";

export default function NewEntryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminEntryForm mode="create" />
    </Suspense>
  );
}

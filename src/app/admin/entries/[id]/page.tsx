import { AdminEntryForm } from "@/components/admin/AdminEntryForm";
import { Suspense } from "react";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function EditEntryPage({ params }: Params) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminEntryForm mode="edit" entryId={id} />
    </Suspense>
  );
}

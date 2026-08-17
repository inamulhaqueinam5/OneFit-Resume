"use client";

import type { Resume } from "@/lib/resume";
import { MasterProfileEditor } from "@/app/dashboard/master-profile-editor";

export function ResumeDocumentEditor({
  documentId,
  documentName,
  initialResume,
}: {
  documentId: string;
  documentName: string;
  initialResume: Resume;
}) {
  return (
    <MasterProfileEditor
      documentId={documentId}
      documentName={documentName}
      documentMode
      initialResume={initialResume}
    />
  );
}

import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppHeader } from "@/app/components/AppHeader";
import { loadResumeDocument } from "@/lib/resume-documents";
import { ResumeDocumentEditor } from "./resume-document-editor";

export const dynamic = "force-dynamic";

export default async function ResumeDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth.protect();
  const { id } = await params;
  const document = await loadResumeDocument(userId, id);
  if (!document) notFound();

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-newsprint">
      <AppHeader />
      <ResumeDocumentEditor documentId={id} documentName={document.name} initialResume={document.resume} />
    </div>
  );
}

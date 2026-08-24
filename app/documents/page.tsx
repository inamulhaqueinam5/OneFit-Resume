import { auth } from "@clerk/nextjs/server";
import { AppHeader } from "@/app/components/AppHeader";
import { loadMasterProfile } from "@/lib/master-profile";
import { listResumeDocuments } from "@/lib/resume-documents";
import { DocumentsList } from "./documents-list";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const { userId } = await auth.protect();

  const [master, documents] = await Promise.all([
    loadMasterProfile(userId),
    listResumeDocuments(userId),
  ]);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-newsprint">
      <AppHeader />
      <DocumentsList
        hasMasterProfile={master !== null}
        initialDocuments={documents.map((document) => ({
          id: document.id,
          name: document.name,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}

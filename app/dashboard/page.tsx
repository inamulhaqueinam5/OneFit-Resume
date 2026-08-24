import { auth, currentUser } from "@clerk/nextjs/server";
import { AppHeader } from "@/app/components/AppHeader";
import { EmptyState } from "@/app/components/EmptyState";
import { loadMasterProfile } from "@/lib/master-profile";
import { MasterProfileEditor } from "./master-profile-editor";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth.protect();

  const profile = await loadMasterProfile(userId);

  if (!profile) {
    const user = await currentUser();
    return (
      <div className="flex flex-1 flex-col bg-newsprint">
        <AppHeader />
        <EmptyState name={user?.firstName ?? undefined} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-newsprint">
      <AppHeader />
      <MasterProfileEditor initialResume={profile} />
    </div>
  );
}

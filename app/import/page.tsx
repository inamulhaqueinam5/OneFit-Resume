import { loadMasterProfile } from "@/lib/master-profile";
import { getCurrentUserId } from "@/lib/current-user";
import { ImportFlow } from "./import-flow";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const existing = await loadMasterProfile(getCurrentUserId());

  return <ImportFlow existingProfile={existing} />;
}

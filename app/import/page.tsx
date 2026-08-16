import { auth } from "@clerk/nextjs/server";
import { loadMasterProfile } from "@/lib/master-profile";
import { ImportFlow } from "./import-flow";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const { userId } = await auth.protect();

  const existing = await loadMasterProfile(userId);

  return <ImportFlow existingProfile={existing} />;
}

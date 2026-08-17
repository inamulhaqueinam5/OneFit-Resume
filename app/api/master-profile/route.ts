import { auth } from "@clerk/nextjs/server";
import { deserializeMasterProfile } from "@/lib/resume";
import { saveMasterProfile } from "@/lib/master-profile";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let resume;
  let writeVersion;
  try {
    const payload: unknown = await request.json();
    if (
      !isRecord(payload) ||
      !("resume" in payload) ||
      typeof payload.writeVersion !== "number" ||
      !Number.isFinite(payload.writeVersion)
    ) {
      throw new Error("Malformed Master Profile save payload");
    }
    resume = deserializeMasterProfile(payload.resume);
    writeVersion = payload.writeVersion;
  } catch {
    return new Response("Invalid Master Profile", { status: 400 });
  }

  await saveMasterProfile(userId, resume, writeVersion);
  return new Response(null, { status: 204 });
}

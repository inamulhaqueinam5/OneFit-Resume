import { auth } from "@clerk/nextjs/server";
import { loadMasterProfile } from "@/lib/master-profile";
import {
  cloneResumeDocument,
  createResumeDocumentFromMaster,
  deleteResumeDocument,
  listResumeDocuments,
  loadResumeDocument,
  saveResumeDocument,
  type ResumeDocumentAction,
} from "@/lib/resume-documents";
import type { Resume } from "@/lib/resume";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const document = await loadResumeDocument(userId, id);
    if (!document) return new Response("Resume Document not found", { status: 404 });
    return Response.json({ document });
  }

  const documents = await listResumeDocuments(userId);
  return Response.json({ documents });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return new Response("Missing Resume Document id", { status: 400 });

  try {
    const payload: unknown = await request.json();
    if (!isRecord(payload) || !isRecord(payload.resume)) {
      return new Response("Invalid Resume Document request", { status: 400 });
    }
    const saved = await saveResumeDocument(userId, id, payload.resume as Resume);
    if (!saved) return new Response("Resume Document not found", { status: 404 });
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Invalid Resume Document request", { status: 400 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let action: ResumeDocumentAction;
  let sourceId = "";
  try {
    const payload: unknown = await request.json();
    if (!isRecord(payload) || (payload.action !== "create" && payload.action !== "clone")) {
      throw new Error("Malformed Resume Document payload");
    }
    action = payload.action;
    if (action === "clone") {
      if (typeof payload.sourceId !== "string" || payload.sourceId.length === 0) {
        throw new Error("Missing source id");
      }
      sourceId = payload.sourceId;
    }
  } catch {
    return new Response("Invalid Resume Document request", { status: 400 });
  }

  if (action === "create") {
    const master = await loadMasterProfile(userId);
    if (!master) {
      return new Response("Master Profile not found", { status: 409 });
    }
    const document = await createResumeDocumentFromMaster(userId, master);
    return Response.json({ document }, { status: 201 });
  }

  const document = await cloneResumeDocument(userId, sourceId);
  if (!document) {
    return new Response("Resume Document not found", { status: 404 });
  }
  return Response.json({ document }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return new Response("Missing Resume Document id", { status: 400 });
  }

  const deleted = await deleteResumeDocument(userId, id);
  if (!deleted) {
    return new Response("Resume Document not found", { status: 404 });
  }
  return new Response(null, { status: 204 });
}

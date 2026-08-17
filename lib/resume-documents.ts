import { Prisma, type ResumeDocument } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cloneDocument, createFromMaster } from "@/lib/resume/operations";
import { deserializeResume } from "@/lib/resume/profile";
import type { Resume } from "@/lib/resume/types";

export type ResumeDocumentAction = "create" | "clone";

export type ResumeDocumentMutation = ResumeDocumentAction | "delete";

export type ResumeDocumentSummary = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type StoredDocument = Pick<ResumeDocument, "id" | "name" | "createdAt" | "updatedAt">;

export function masterDocumentName(master: Resume): string {
  const name = master.contact.name.trim();
  return name ? `${name}'s Resume` : "Untitled Resume";
}

export function cloneDocumentName(sourceName: string): string {
  return `${sourceName} (Copy)`;
}

function toSummary(record: StoredDocument): ResumeDocumentSummary {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listResumeDocuments(
  clerkUserId: string,
): Promise<ResumeDocumentSummary[]> {
  const records = await prisma.resumeDocument.findMany({
    where: { clerkUserId },
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toSummary);
}

export async function loadResumeDocument(
  clerkUserId: string,
  documentId: string,
): Promise<{ name: string; resume: Resume } | null> {
  const record = await prisma.resumeDocument.findUnique({ where: { id: documentId } });
  if (!record || record.clerkUserId !== clerkUserId) return null;
  return { name: record.name, resume: deserializeResume(record.resume) };
}

export async function saveResumeDocument(
  clerkUserId: string,
  documentId: string,
  resume: Resume,
): Promise<boolean> {
  const validated = deserializeResume(resume);
  const result = await prisma.resumeDocument.updateMany({
    where: { id: documentId, clerkUserId },
    data: { resume: validated as unknown as Prisma.InputJsonValue },
  });
  return result.count > 0;
}

export async function createResumeDocumentFromMaster(
  clerkUserId: string,
  master: Resume,
): Promise<ResumeDocumentSummary> {
  const document = createFromMaster(master);
  const record = await prisma.resumeDocument.create({
    data: {
      clerkUserId,
      name: masterDocumentName(master),
      resume: document as unknown as Prisma.InputJsonValue,
    },
  });
  return toSummary(record);
}

export async function cloneResumeDocument(
  clerkUserId: string,
  sourceId: string,
): Promise<ResumeDocumentSummary | null> {
  const source = await prisma.resumeDocument.findUnique({ where: { id: sourceId } });
  if (!source || source.clerkUserId !== clerkUserId) return null;

  const cloned = cloneDocument(source.resume as unknown as Resume);
  const record = await prisma.resumeDocument.create({
    data: {
      clerkUserId,
      name: cloneDocumentName(source.name),
      resume: cloned as unknown as Prisma.InputJsonValue,
    },
  });
  return toSummary(record);
}

export async function deleteResumeDocument(
  clerkUserId: string,
  documentId: string,
): Promise<boolean> {
  const result = await prisma.resumeDocument.deleteMany({
    where: { id: documentId, clerkUserId },
  });
  return result.count > 0;
}

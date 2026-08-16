import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deserializeResume } from "@/lib/resume/profile";
import type { Resume } from "@/lib/resume/types";

export async function saveMasterProfile(
  clerkUserId: string,
  resume: Resume,
): Promise<Resume> {
  const data = resume as unknown as Prisma.InputJsonValue;
  const record = await prisma.masterProfile.upsert({
    where: { clerkUserId },
    create: { clerkUserId, resume: data },
    update: { resume: data },
  });
  return deserializeResume(record.resume);
}

export async function loadMasterProfile(
  clerkUserId: string,
): Promise<Resume | null> {
  const record = await prisma.masterProfile.findUnique({
    where: { clerkUserId },
  });
  if (!record) return null;
  return deserializeResume(record.resume);
}

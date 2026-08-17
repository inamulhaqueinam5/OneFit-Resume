import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deserializeMasterProfile } from "@/lib/resume/profile";
import type { Resume } from "@/lib/resume/types";

const WRITE_VERSION_KEY = "__onefitWriteVersion";
type StoredResume = Resume & { [WRITE_VERSION_KEY]?: number };

function getWriteVersion(value: unknown): number | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const candidate = (value as Record<string, unknown>)[WRITE_VERSION_KEY];
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}

function withWriteVersion(resume: Resume, writeVersion: number): StoredResume {
  return { ...resume, [WRITE_VERSION_KEY]: writeVersion };
}

function withoutWriteVersion(value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
  const clean = { ...(value as StoredResume) };
  delete clean[WRITE_VERSION_KEY];
  return clean;
}

function isSerializationConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

export async function saveMasterProfile(
  clerkUserId: string,
  resume: Resume,
  writeVersion?: number,
): Promise<Resume> {
  const validated = deserializeMasterProfile(resume);
  const stored =
    writeVersion === undefined ? validated : withWriteVersion(validated, writeVersion);
  const data = stored as unknown as Prisma.InputJsonValue;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const record = await prisma.$transaction(
        async (transaction) => {
          const current = await transaction.masterProfile.findUnique({
            where: { clerkUserId },
          });

          if (
            current &&
            writeVersion !== undefined &&
            (getWriteVersion(current.resume) ?? -1) >= writeVersion
          ) {
            return current;
          }

          if (current) {
            return transaction.masterProfile.update({
              where: { clerkUserId },
              data: { resume: data },
            });
          }

          return transaction.masterProfile.create({
            data: { clerkUserId, resume: data },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return deserializeMasterProfile(withoutWriteVersion(record.resume));
    } catch (error) {
      if (!isSerializationConflict(error) || attempt === 2) throw error;
    }
  }

  throw new Error("Master Profile save could not be completed.");
}

export async function loadMasterProfile(
  clerkUserId: string,
): Promise<Resume | null> {
  const record = await prisma.masterProfile.findUnique({
    where: { clerkUserId },
  });
  if (!record) return null;
  return deserializeMasterProfile(withoutWriteVersion(record.resume));
}

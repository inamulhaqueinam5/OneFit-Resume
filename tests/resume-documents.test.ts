import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    resumeDocument: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import {
  cloneDocumentName,
  cloneResumeDocument,
  createResumeDocumentFromMaster,
  deleteResumeDocument,
  listResumeDocuments,
  masterDocumentName,
  type ResumeDocumentSummary,
} from "@/lib/resume-documents";
import type { Resume } from "@/lib/resume";

const master: Resume = {
  id: "master-1",
  contact: {
    name: "Ada Lovelace",
    tagline: "Engineer",
    email: "ada@example.com",
    phone: "",
    location: "London",
    links: [],
    availability: "",
  },
  profilePicture: null,
  compressionLevel: 100,
  sections: [
    {
      id: "experience-section",
      catalogId: "experience",
      title: "Experience",
      visible: true,
      entries: [
        {
          id: "experience-entry",
          fields: [
            {
              kind: "title",
              runs: [{ text: "Engineer", bold: true, italic: false, href: null }],
            },
          ],
        },
      ],
    },
  ],
};

const sourceResume: Resume = {
  ...master,
  id: "doc-1",
  compressionLevel: 70,
};

const sourceRecord = {
  id: "doc-1",
  clerkUserId: "user-1",
  name: "Product Designer",
  resume: sourceResume,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

function summary(overrides: Partial<ResumeDocumentSummary> = {}): ResumeDocumentSummary {
  return {
    id: "doc-1",
    name: "Product Designer",
    createdAt: sourceRecord.createdAt,
    updatedAt: sourceRecord.updatedAt,
    ...overrides,
  };
}

describe("masterDocumentName", () => {
  it("uses the Master Profile contact name", () => {
    expect(masterDocumentName(master)).toBe("Ada Lovelace's Resume");
  });

  it("falls back when the contact name is empty", () => {
    const unnamed = { ...master, contact: { ...master.contact, name: "" } };
    expect(masterDocumentName(unnamed)).toBe("Untitled Resume");
  });
});

describe("cloneDocumentName", () => {
  it("marks a clone with a copy suffix", () => {
    expect(cloneDocumentName("Product Designer")).toBe("Product Designer (Copy)");
  });
});

describe("listResumeDocuments", () => {
  beforeEach(() => {
    mocks.prisma.resumeDocument.findMany.mockReset();
  });

  it("lists the authenticated user's documents most recently updated first", async () => {
    mocks.prisma.resumeDocument.findMany.mockResolvedValue([sourceRecord]);

    const result = await listResumeDocuments("user-1");

    expect(result).toEqual([summary()]);
    expect(mocks.prisma.resumeDocument.findMany).toHaveBeenCalledWith({
      where: { clerkUserId: "user-1" },
      orderBy: { updatedAt: "desc" },
    });
  });
});

describe("createResumeDocumentFromMaster", () => {
  beforeEach(() => {
    mocks.prisma.resumeDocument.create.mockReset();
  });

  it("stores an independent deep copy named after the Master Profile", async () => {
    mocks.prisma.resumeDocument.create.mockResolvedValue({
      id: "doc-new",
      clerkUserId: "user-1",
      name: "Ada Lovelace's Resume",
      resume: { ...sourceResume, id: "doc-new" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createResumeDocumentFromMaster("user-1", master);

    expect(result.id).toBe("doc-new");
    expect(result.name).toBe("Ada Lovelace's Resume");
    const created = mocks.prisma.resumeDocument.create.mock.calls[0][0];
    expect(created.data.clerkUserId).toBe("user-1");
    expect(created.data.name).toBe("Ada Lovelace's Resume");
    expect(created.data.resume.id).not.toBe(master.id);
    expect(created.data.resume.compressionLevel).toBe(100);
    expect(created.data.resume.sections).toEqual(master.sections);
    expect(created.data.resume.sections).not.toBe(master.sections);
  });
});

describe("cloneResumeDocument", () => {
  beforeEach(() => {
    mocks.prisma.resumeDocument.findUnique.mockReset();
    mocks.prisma.resumeDocument.create.mockReset();
  });

  it("clones an owned document with a copy suffix and fresh id", async () => {
    mocks.prisma.resumeDocument.findUnique.mockResolvedValue(sourceRecord);
    mocks.prisma.resumeDocument.create.mockResolvedValue({
      id: "doc-copy",
      clerkUserId: "user-1",
      name: "Product Designer (Copy)",
      resume: { ...sourceResume, id: "doc-copy" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await cloneResumeDocument("user-1", "doc-1");

    expect(result?.name).toBe("Product Designer (Copy)");
    const created = mocks.prisma.resumeDocument.create.mock.calls[0][0];
    expect(created.data.resume.id).not.toBe(sourceResume.id);
    expect(created.data.resume.compressionLevel).toBe(70);
    expect(created.data.resume.sections).toEqual(sourceResume.sections);
  });

  it("returns null when the source document does not exist", async () => {
    mocks.prisma.resumeDocument.findUnique.mockResolvedValue(null);

    expect(await cloneResumeDocument("user-1", "missing")).toBeNull();
    expect(mocks.prisma.resumeDocument.create).not.toHaveBeenCalled();
  });

  it("returns null when the source document belongs to another user", async () => {
    mocks.prisma.resumeDocument.findUnique.mockResolvedValue({
      ...sourceRecord,
      clerkUserId: "user-other",
    });

    expect(await cloneResumeDocument("user-1", "doc-1")).toBeNull();
    expect(mocks.prisma.resumeDocument.create).not.toHaveBeenCalled();
  });
});

describe("deleteResumeDocument", () => {
  beforeEach(() => {
    mocks.prisma.resumeDocument.deleteMany.mockReset();
  });

  it("deletes only the matching document owned by the user", async () => {
    mocks.prisma.resumeDocument.deleteMany.mockResolvedValue({ count: 1 });

    const deleted = await deleteResumeDocument("user-1", "doc-1");

    expect(deleted).toBe(true);
    expect(mocks.prisma.resumeDocument.deleteMany).toHaveBeenCalledWith({
      where: { id: "doc-1", clerkUserId: "user-1" },
    });
  });

  it("reports false when no document matched", async () => {
    mocks.prisma.resumeDocument.deleteMany.mockResolvedValue({ count: 0 });

    expect(await deleteResumeDocument("user-1", "missing")).toBe(false);
  });
});
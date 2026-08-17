import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  loadMasterProfile: vi.fn(),
  listResumeDocuments: vi.fn(),
  createResumeDocumentFromMaster: vi.fn(),
  cloneResumeDocument: vi.fn(),
  deleteResumeDocument: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/master-profile", () => ({ loadMasterProfile: mocks.loadMasterProfile }));
vi.mock("@/lib/resume-documents", () => ({
  listResumeDocuments: mocks.listResumeDocuments,
  createResumeDocumentFromMaster: mocks.createResumeDocumentFromMaster,
  cloneResumeDocument: mocks.cloneResumeDocument,
  deleteResumeDocument: mocks.deleteResumeDocument,
}));

import { DELETE, GET, POST } from "@/app/api/resume-documents/route";

const createdAt = new Date("2026-01-01T00:00:00Z");
const updatedAt = new Date("2026-01-02T00:00:00Z");

const summary = {
  id: "doc-1",
  name: "Product Designer",
  createdAt,
  updatedAt,
};

const serializedSummary = {
  ...summary,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
};

const master = {
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
  sections: [],
};

describe("Resume Documents route", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.loadMasterProfile.mockReset();
    mocks.listResumeDocuments.mockReset();
    mocks.createResumeDocumentFromMaster.mockReset();
    mocks.cloneResumeDocument.mockReset();
    mocks.deleteResumeDocument.mockReset();
    mocks.auth.mockResolvedValue({ userId: "user-1" });
  });

  describe("GET", () => {
    it("requires an authenticated user", async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      const response = await GET();

      expect(response.status).toBe(401);
      expect(mocks.listResumeDocuments).not.toHaveBeenCalled();
    });

    it("returns the authenticated user's Resume Documents", async () => {
      mocks.listResumeDocuments.mockResolvedValue([summary]);

      const response = await GET();

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ documents: [serializedSummary] });
      expect(mocks.listResumeDocuments).toHaveBeenCalledWith("user-1");
    });
  });

  describe("POST", () => {
    function jsonRequest(body: unknown): Request {
      return new Request("http://localhost/api/resume-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    it("requires an authenticated user", async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      const response = await POST(jsonRequest({ action: "create" }));

      expect(response.status).toBe(401);
      expect(mocks.createResumeDocumentFromMaster).not.toHaveBeenCalled();
    });

    it("rejects a malformed payload", async () => {
      const response = await POST(jsonRequest({ action: "rename" }));

      expect(response.status).toBe(400);
      expect(mocks.createResumeDocumentFromMaster).not.toHaveBeenCalled();
      expect(mocks.cloneResumeDocument).not.toHaveBeenCalled();
    });

    it("rejects a clone request without a source id", async () => {
      const response = await POST(jsonRequest({ action: "clone" }));

      expect(response.status).toBe(400);
      expect(mocks.cloneResumeDocument).not.toHaveBeenCalled();
    });

    it("creates from the Master Profile and returns the new document", async () => {
      mocks.loadMasterProfile.mockResolvedValue(master);
      mocks.createResumeDocumentFromMaster.mockResolvedValue(summary);

      const response = await POST(jsonRequest({ action: "create" }));

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ document: serializedSummary });
      expect(mocks.loadMasterProfile).toHaveBeenCalledWith("user-1");
      expect(mocks.createResumeDocumentFromMaster).toHaveBeenCalledWith("user-1", master);
    });

    it("conflicts when there is no Master Profile to copy from", async () => {
      mocks.loadMasterProfile.mockResolvedValue(null);

      const response = await POST(jsonRequest({ action: "create" }));

      expect(response.status).toBe(409);
      expect(mocks.createResumeDocumentFromMaster).not.toHaveBeenCalled();
    });

    it("clones an existing document and returns the new one", async () => {
      mocks.cloneResumeDocument.mockResolvedValue(summary);

      const response = await POST(
        jsonRequest({ action: "clone", sourceId: "doc-1" }),
      );

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ document: serializedSummary });
      expect(mocks.cloneResumeDocument).toHaveBeenCalledWith("user-1", "doc-1");
    });

    it("returns 404 when the clone source is missing or foreign", async () => {
      mocks.cloneResumeDocument.mockResolvedValue(null);

      const response = await POST(
        jsonRequest({ action: "clone", sourceId: "missing" }),
      );

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("requires an authenticated user", async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      const response = await DELETE(
        new Request("http://localhost/api/resume-documents?id=doc-1", {
          method: "DELETE",
        }),
      );

      expect(response.status).toBe(401);
      expect(mocks.deleteResumeDocument).not.toHaveBeenCalled();
    });

    it("rejects a missing document id", async () => {
      const response = await DELETE(
        new Request("http://localhost/api/resume-documents", {
          method: "DELETE",
        }),
      );

      expect(response.status).toBe(400);
      expect(mocks.deleteResumeDocument).not.toHaveBeenCalled();
    });

    it("deletes the matching document", async () => {
      mocks.deleteResumeDocument.mockResolvedValue(true);

      const response = await DELETE(
        new Request("http://localhost/api/resume-documents?id=doc-1", {
          method: "DELETE",
        }),
      );

      expect(response.status).toBe(204);
      expect(mocks.deleteResumeDocument).toHaveBeenCalledWith("user-1", "doc-1");
    });

    it("returns 404 when the document is missing or foreign", async () => {
      mocks.deleteResumeDocument.mockResolvedValue(false);

      const response = await DELETE(
        new Request("http://localhost/api/resume-documents?id=missing", {
          method: "DELETE",
        }),
      );

      expect(response.status).toBe(404);
    });
  });
});
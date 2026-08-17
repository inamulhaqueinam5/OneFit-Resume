import { beforeEach, describe, expect, it, vi } from "vitest";
import { deserializeResume } from "@/lib/resume";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  saveMasterProfile: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/master-profile", () => ({ saveMasterProfile: mocks.saveMasterProfile }));

import { POST } from "@/app/api/master-profile/route";

const resume = {
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
  sections: [],
  compressionLevel: 100,
};

describe("Master Profile save route", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.saveMasterProfile.mockReset();
    mocks.auth.mockResolvedValue({ userId: "user-1" });
  });

  it("requires an authenticated user", async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const response = await POST(new Request("http://localhost/api/master-profile"));

    expect(response.status).toBe(401);
    expect(mocks.saveMasterProfile).not.toHaveBeenCalled();
  });

  it("validates the submitted Resume before saving it", async () => {
    const response = await POST(
      new Request("http://localhost/api/master-profile", {
        method: "POST",
        body: JSON.stringify({ invalid: true }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.saveMasterProfile).not.toHaveBeenCalled();
  });

  it("rejects Custom Sections in a Master Profile", async () => {
    const response = await POST(
      new Request("http://localhost/api/master-profile", {
        method: "POST",
        body: JSON.stringify({
          resume: {
            ...resume,
            sections: [
              {
                id: "custom-section",
                catalogId: "custom",
                title: "Awards",
                entries: [],
                visible: true,
              },
            ],
          },
          writeVersion: 1,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.saveMasterProfile).not.toHaveBeenCalled();
  });

  it("saves the authenticated user's latest complete Resume", async () => {
    const writeVersion = 42;
    const response = await POST(
      new Request("http://localhost/api/master-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, writeVersion }),
      }),
    );

    expect(response.status).toBe(204);
    expect(mocks.saveMasterProfile).toHaveBeenCalledWith(
      "user-1",
      deserializeResume(resume),
      writeVersion,
    );
  });
});

import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
  },
  current: null as { resume: unknown } | null,
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import { saveMasterProfile } from "@/lib/master-profile";

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

describe("saveMasterProfile", () => {
  it("keeps the newest write when an older save arrives later", async () => {
    mocks.current = null;
    const transaction = {
      masterProfile: {
        findUnique: vi.fn(async () => mocks.current),
        create: vi.fn(async ({ data }: { data: { resume: unknown } }) => {
          mocks.current = { resume: data.resume };
          return mocks.current;
        }),
        update: vi.fn(async ({ data }: { data: { resume: unknown } }) => {
          mocks.current = { resume: data.resume };
          return mocks.current;
        }),
      },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(transaction));

    await saveMasterProfile("user-1", { ...resume, contact: { ...resume.contact, name: "New" } }, 20);
    await saveMasterProfile("user-1", { ...resume, contact: { ...resume.contact, name: "Old" } }, 10);

    const current = mocks.current as unknown as { resume: typeof resume };
    expect((current.resume as typeof resume).contact.name).toBe("New");
    expect(transaction.masterProfile.update).toHaveBeenCalledTimes(0);
  });
});

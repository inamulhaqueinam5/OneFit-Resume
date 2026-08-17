import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/import/actions", () => ({
  createMasterProfile: vi.fn(),
  parseUploadedDocx: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@clerk/nextjs", () => ({ UserButton: () => null }));

import { createMasterProfile, parseUploadedDocx } from "@/app/import/actions";
import { ImportFlow } from "@/app/import/import-flow";
import type { Resume } from "@/lib/resume";

const profile: Resume = {
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

describe("ImportFlow re-import state", () => {
  it("makes the overwrite review explicit for an existing Master Profile", async () => {
    vi.mocked(parseUploadedDocx).mockResolvedValue({
      resume: profile,
      review: [],
      isOfficialTemplate: true,
      warning: null,
    });
    render(<ImportFlow existingProfile={profile} />);

    expect(screen.getByText(/will overwrite it after you confirm the review/i)).toBeInTheDocument();
    fireEvent.submit(screen.getByRole("button", { name: /Parse template/i }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("button", { name: /Confirm & update Master Profile/i })).toBeInTheDocument());
    expect(createMasterProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Confirm & update Master Profile/i }));
    await waitFor(() => expect(createMasterProfile).toHaveBeenCalledWith(profile));
  });
});

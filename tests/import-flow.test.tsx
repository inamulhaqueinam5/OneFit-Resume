import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/import/actions", () => ({
  createMasterProfile: vi.fn(),
  parseUploadedDocx: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/import",
}));
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

describe("ImportFlow application states", () => {
  it("labels the upload and exposes a pending parsing state", async () => {
    let resolveUpload!: (value: Awaited<ReturnType<typeof parseUploadedDocx>>) => void;
    vi.mocked(parseUploadedDocx).mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve;
      }),
    );
    render(<ImportFlow existingProfile={null} />);

    expect(screen.getByLabelText(/Word template/i)).toBeInTheDocument();
    fireEvent.submit(screen.getByRole("button", { name: /Parse template/i }).closest("form")!);

    expect(screen.getByRole("status")).toHaveTextContent(/Parsing/i);
    expect(screen.getByRole("button", { name: /Parsing/i })).toBeDisabled();

    resolveUpload({
      resume: profile,
      review: [],
      isOfficialTemplate: true,
      warning: null,
    });
    await waitFor(() => expect(screen.getByText(/Parsed result/i)).toBeInTheDocument());
  });

  it("keeps the upload available and explains how to recover from a parse error", async () => {
    vi.mocked(parseUploadedDocx).mockRejectedValueOnce(
      new Error("The document could not be read. Choose a valid .docx file and try again."),
    );
    render(<ImportFlow existingProfile={null} />);

    fireEvent.submit(screen.getByRole("button", { name: /Parse template/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Choose a valid .docx file/i);
    });
    expect(screen.getByRole("button", { name: /Parse template/i })).not.toBeDisabled();
  });

  it("keeps the review visible when saving fails and offers a retry", async () => {
    vi.mocked(parseUploadedDocx).mockResolvedValueOnce({
      resume: profile,
      review: [],
      isOfficialTemplate: true,
      warning: null,
    });
    vi.mocked(createMasterProfile).mockRejectedValueOnce(
      new Error("Could not save the Master Profile. Try again."),
    );
    render(<ImportFlow existingProfile={null} />);

    fireEvent.submit(screen.getByRole("button", { name: /Parse template/i }).closest("form")!);
    await waitFor(() => expect(screen.getByRole("button", { name: /Confirm & create/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Confirm & create/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/Try again/i));
    expect(screen.getByText(/Parsed result/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirm & create/i })).not.toBeDisabled();
  });

  it("announces the saved state with a clear next action", async () => {
    vi.mocked(parseUploadedDocx).mockResolvedValueOnce({
      resume: profile,
      review: [],
      isOfficialTemplate: true,
      warning: null,
    });
    vi.mocked(createMasterProfile).mockResolvedValueOnce(undefined);
    render(<ImportFlow existingProfile={null} />);

    fireEvent.submit(screen.getByRole("button", { name: /Parse template/i }).closest("form")!);
    await waitFor(() => expect(screen.getByRole("button", { name: /Confirm & create/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Confirm & create/i }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/saved/i));
    expect(screen.getByRole("button", { name: /Import again/i })).toBeInTheDocument();
  });
});

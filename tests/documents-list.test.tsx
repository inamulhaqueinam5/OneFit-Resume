import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentsList, type DocumentSummary } from "@/app/documents/documents-list";

const documents: DocumentSummary[] = [
  {
    id: "doc-1",
    name: "Product Designer",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "doc-2",
    name: "Staff Engineer",
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-04T00:00:00Z",
  },
];

function okJson(payload: unknown) {
  return {
    ok: true,
    json: async () => payload,
  };
}

describe("DocumentsList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists all Resume Documents", () => {
    render(<DocumentsList initialDocuments={documents} hasMasterProfile />);

    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("Created Jan 1, 2026")).toBeInTheDocument();
  });

  it("creates a Resume Document from the Master Profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        document: {
          id: "doc-3",
          name: "Ada Lovelace's Resume",
          createdAt: "2026-01-05T00:00:00Z",
          updatedAt: "2026-01-05T00:00:00Z",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DocumentsList initialDocuments={documents} hasMasterProfile />);
    fireEvent.click(screen.getByRole("button", { name: /Create from Master Profile/i }));

    await waitFor(() =>
      expect(screen.getByText("Ada Lovelace's Resume")).toBeInTheDocument(),
    );
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ action: "create" });
  });

  it("clones a Resume Document into a new one", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        document: {
          id: "doc-4",
          name: "Product Designer (Copy)",
          createdAt: "2026-01-06T00:00:00Z",
          updatedAt: "2026-01-06T00:00:00Z",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DocumentsList initialDocuments={documents} hasMasterProfile />);
    fireEvent.click(screen.getByRole("button", { name: "Clone Product Designer" }));

    await waitFor(() =>
      expect(screen.getByText("Product Designer (Copy)")).toBeInTheDocument(),
    );
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ action: "clone", sourceId: "doc-1" });
  });

  it("deletes a Resume Document", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<DocumentsList initialDocuments={documents} hasMasterProfile />);
    fireEvent.click(screen.getByRole("button", { name: "Delete Product Designer" }));

    await waitFor(() =>
      expect(screen.queryByText("Product Designer")).not.toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/resume-documents?id=doc-1", {
      method: "DELETE",
    });
  });

  it("disables creating until a Master Profile exists", () => {
    render(<DocumentsList initialDocuments={documents} hasMasterProfile={false} />);

    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create from Master Profile/i }),
    ).toBeDisabled();
  });

  it("shows an error and keeps the list when creation fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<DocumentsList initialDocuments={documents} hasMasterProfile />);
    fireEvent.click(screen.getByRole("button", { name: /Create from Master Profile/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
  });
});

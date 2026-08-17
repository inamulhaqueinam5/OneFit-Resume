import { act, render, screen } from "@testing-library/react";
import { useAutosave } from "@/app/dashboard/use-autosave";
import { describe, expect, it, vi } from "vitest";

function AutosaveHarness({
  value,
  dirty,
  save,
  unloadSave,
}: {
  value: string;
  dirty: boolean;
  save: (value: string) => Promise<void>;
  unloadSave: (value: string) => boolean;
}) {
  const { status } = useAutosave({
    value,
    dirty,
    save,
    unloadSave,
  });

  return <output data-testid="status">{status}</output>;
}

describe("useAutosave", () => {
  it("waits two seconds after the last change before saving", async () => {
    vi.useFakeTimers();
    const save = vi.fn<(value: string) => Promise<void>>().mockResolvedValue(undefined);
    const unloadSave = vi.fn<(value: string) => boolean>().mockReturnValue(true);
    const { rerender } = render(
      <AutosaveHarness value="initial" dirty={false} save={save} unloadSave={unloadSave} />,
    );

    rerender(<AutosaveHarness value="edited" dirty save={save} unloadSave={unloadSave} />);
    vi.advanceTimersByTime(1999);
    expect(save).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledWith("edited", expect.any(AbortSignal));
    expect(screen.getByTestId("status")).toHaveTextContent("saved");
    vi.useRealTimers();
  });

  it("sends the latest dirty value when the tab unloads", () => {
    const save = vi.fn<(value: string) => Promise<void>>().mockResolvedValue(undefined);
    const unloadSave = vi.fn<(value: string) => boolean>().mockReturnValue(true);

    render(<AutosaveHarness value="unsaved" dirty save={save} unloadSave={unloadSave} />);
    window.dispatchEvent(new Event("beforeunload"));

    expect(unloadSave).toHaveBeenCalledWith("unsaved");
  });

  it("starts a newer draft without waiting for an older save in flight", async () => {
    vi.useFakeTimers();
    let resolveFirst: (() => void) | undefined;
    const save = vi.fn<(value: string, signal?: AbortSignal) => Promise<void>>((value) => {
      if (value === "first") {
        return new Promise<void>((resolve) => {
          resolveFirst = resolve;
        });
      }
      return Promise.resolve();
    });
    const unloadSave = vi.fn<(value: string) => boolean>().mockReturnValue(true);
    const { rerender } = render(
      <AutosaveHarness value="initial" dirty={false} save={save} unloadSave={unloadSave} />,
    );

    rerender(<AutosaveHarness value="first" dirty save={save} unloadSave={unloadSave} />);
    await act(async () => {
      vi.advanceTimersByTime(2_000);
      await Promise.resolve();
    });
    rerender(<AutosaveHarness value="second" dirty save={save} unloadSave={unloadSave} />);
    await act(async () => {
      vi.advanceTimersByTime(2_000);
      await Promise.resolve();
    });

    expect(save).toHaveBeenNthCalledWith(2, "second", expect.any(AbortSignal));
    resolveFirst?.();
    vi.useRealTimers();
  });
});

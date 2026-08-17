"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type UseAutosaveOptions<T> = {
  value: T;
  dirty: boolean;
  save: (value: T, signal?: AbortSignal) => Promise<void>;
  unloadSave: (value: T) => boolean;
  delay?: number;
};

export function useAutosave<T>({
  value,
  dirty,
  save,
  unloadSave,
  delay = 2_000,
}: UseAutosaveOptions<T>) {
  const valueRef = useRef(value);
  const dirtyRef = useRef(dirty);
  const saveRef = useRef(save);
  const unloadSaveRef = useRef(unloadSave);
  const unloadSentRef = useRef(false);
  const savedValueRef = useRef<T | undefined>(undefined);
  const activeSaveControllerRef = useRef<AbortController | null>(null);
  const saveSequenceRef = useRef(0);
  const [phase, setPhase] = useState<"saving" | "error" | null>(null);
  const [savedValue, setSavedValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    valueRef.current = value;
    dirtyRef.current = dirty;
    saveRef.current = save;
    unloadSaveRef.current = unloadSave;
  }, [dirty, save, unloadSave, value]);

  useEffect(() => {
    if (!dirty) return;
    const timeout = window.setTimeout(async () => {
      const valueToSave = valueRef.current;
      const sequence = saveSequenceRef.current + 1;
      saveSequenceRef.current = sequence;
      activeSaveControllerRef.current?.abort();
      const controller = new AbortController();
      activeSaveControllerRef.current = controller;
      setPhase("saving");
      try {
        await saveRef.current(valueToSave, controller.signal);
        if (sequence !== saveSequenceRef.current) return;
        savedValueRef.current = valueToSave;
        setSavedValue(valueToSave);
        setPhase(null);
      } catch {
        if (sequence !== saveSequenceRef.current || controller.signal.aborted) return;
        setPhase("error");
      } finally {
        if (sequence === saveSequenceRef.current) {
          activeSaveControllerRef.current = null;
        }
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, dirty, value]);

  useEffect(() => {
    const saveOnUnload = () => {
      if (
        !dirtyRef.current ||
        savedValueRef.current === valueRef.current ||
        unloadSentRef.current
      ) {
        return;
      }
      activeSaveControllerRef.current?.abort();
      saveSequenceRef.current += 1;
      unloadSentRef.current = true;
      unloadSaveRef.current(valueRef.current);
    };

    window.addEventListener("beforeunload", saveOnUnload);
    window.addEventListener("pagehide", saveOnUnload);
    return () => {
      window.removeEventListener("beforeunload", saveOnUnload);
      window.removeEventListener("pagehide", saveOnUnload);
    };
  }, []);

  const status: AutosaveStatus =
    !dirty
      ? "idle"
      : phase === "saving"
        ? "saving"
        : phase === "error"
          ? "error"
          : savedValue === value
            ? "saved"
            : "pending";

  return { status };
}

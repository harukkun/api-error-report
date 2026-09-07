import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, SETTINGS_KEY, type Settings } from "../../lib/defaults";
import { FIELDS, mergeSelectedFieldIds } from "../../lib/fields";

type Stored = Partial<Settings> & { knownFieldIds?: string[] };

const hasChromeStorage = typeof chrome !== "undefined" && !!chrome.storage?.sync;

async function load(): Promise<Stored> {
  if (hasChromeStorage) {
    const res = await chrome.storage.sync.get(SETTINGS_KEY);
    return (res[SETTINGS_KEY] as Stored) ?? {};
  }
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Stored;
  } catch {
    return {};
  }
}

async function persist(value: Stored): Promise<void> {
  if (hasChromeStorage) {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: value });
    return;
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
}

function hydrate(stored: Stored): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    selectedFieldIds: mergeSelectedFieldIds(stored.selectedFieldIds, stored.knownFieldIds),
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setSettings(hydrate(s)));
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      void persist({ ...next, knownFieldIds: FIELDS.map((f) => f.id) });
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const next = hydrate({});
    setSettings(next);
    void persist({ ...next, knownFieldIds: FIELDS.map((f) => f.id) });
  }, []);

  return { settings, update, reset };
}

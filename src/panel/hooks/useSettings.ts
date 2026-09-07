import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, SETTINGS_KEY, type Settings } from "../../lib/defaults";
import { FIELDS, mergeSelectedFieldIds } from "../../lib/fields";

type Stored = Partial<Settings> & { knownFieldIds?: string[] };

const hasChromeStorage = typeof chrome !== "undefined" && !!chrome.storage?.sync;

async function load(): Promise<Stored> {
  if (hasChromeStorage) {
    try {
      const res = await chrome.storage.sync.get(SETTINGS_KEY);
      return (res[SETTINGS_KEY] as Stored) ?? {};
    } catch (err) {
      // 확장 컨텍스트 무효화 등: 기본값으로 진행
      console.warn("[network-error-report] settings load failed:", err);
      return {};
    }
  }
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Stored;
  } catch {
    return {};
  }
}

async function persist(value: Stored): Promise<void> {
  if (hasChromeStorage) {
    try {
      await chrome.storage.sync.set({ [SETTINGS_KEY]: value });
    } catch (err) {
      // 확장이 갱신되어 옛 패널 컨텍스트가 무효화된 경우. 배너는 useExtensionAlive 가 표시
      console.warn("[network-error-report] settings persist failed:", err);
    }
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

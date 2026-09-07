import { useCallback, useEffect, useRef, useState } from "react";
import { fromHarEntry, type CapturedRequest, type HarEntry } from "../../lib/har";
import { mockRequests } from "../mock";

const MAX_ENTRIES = 2000;
const hasDevtools = typeof chrome !== "undefined" && !!chrome.devtools?.network;

export function useNetworkCapture(preserveLog: boolean) {
  const [requests, setRequests] = useState<CapturedRequest[]>(() => (hasDevtools ? [] : mockRequests()));
  const pageUrlRef = useRef("");
  const preserveRef = useRef(preserveLog);
  const seq = useRef(0);
  preserveRef.current = preserveLog;

  useEffect(() => {
    if (!hasDevtools) return;

    chrome.devtools.inspectedWindow.eval("location.href", (...args: unknown[]) => {
      const result = args[0];
      if (typeof result === "string") pageUrlRef.current = result;
    });

    const onFinished = (entry: chrome.devtools.network.Request) => {
      const id = `${Date.now()}-${seq.current++}`;
      const req = fromHarEntry(entry as unknown as HarEntry, id, pageUrlRef.current);
      setRequests((prev) => {
        const next = [...prev, req];
        return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
      });
      entry.getContent((content, encoding) => {
        const mimeType = (entry as unknown as HarEntry).response.content.mimeType ?? "";
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, responseBody: { mimeType, text: content ?? "", encoding: encoding || undefined } }
              : r,
          ),
        );
      });
    };

    const onNavigated = (url: string) => {
      pageUrlRef.current = url;
      if (!preserveRef.current) setRequests([]);
    };

    chrome.devtools.network.onRequestFinished.addListener(onFinished);
    chrome.devtools.network.onNavigated.addListener(onNavigated);
    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(onFinished);
      chrome.devtools.network.onNavigated.removeListener(onNavigated);
    };
  }, []);

  const clear = useCallback(() => setRequests([]), []);

  return { requests, clear, isLive: hasDevtools };
}

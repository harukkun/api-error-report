import { useEffect, useState } from "react";

const isExtension = typeof chrome !== "undefined" && !!chrome.runtime?.id;

export function isContextInvalidated(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /Extension context invalidated|context invalidated|message port closed/i.test(msg);
}

/** 확장을 chrome://extensions 에서 새로고침하면 열려 있던 패널의 컨텍스트가 무효화됨. 이를 감지 */
export function useExtensionAlive(): boolean {
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    if (!isExtension) return;

    const markDead = () => setAlive(false);

    // 1) chrome.runtime.id 가 사라지면 무효화됨
    const timer = window.setInterval(() => {
      if (!chrome.runtime?.id) markDead();
    }, 1500);

    // 2) chrome.* API 호출이 거부되면서 올라오는 unhandledrejection 도 흡수
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isContextInvalidated(e.reason)) {
        e.preventDefault();
        markDead();
      }
    };
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return alive;
}

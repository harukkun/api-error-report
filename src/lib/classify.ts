import type { CapturedRequest } from "./har";

const XHR_TYPES = new Set(["xhr", "fetch"]);

export function isXhrLike(req: CapturedRequest): boolean {
  return XHR_TYPES.has(req.resourceType.toLowerCase());
}

export function isError(req: CapturedRequest): boolean {
  return req.status === 0 || req.status >= 400;
}

export function isPreflight(req: CapturedRequest): boolean {
  return req.method.toUpperCase() === "OPTIONS";
}

export type StatusTone = "ok" | "warn" | "error" | "neutral";

export function statusTone(status: number): StatusTone {
  if (status === 0 || status >= 500) return "error";
  if (status >= 400) return "warn";
  if (status >= 200 && status < 400) return "ok";
  return "neutral";
}

export type Env = "dev" | "stage" | "prod";

export function detectEnv(url: string): Env {
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    /* URL 아님 → 원문으로 판별 */
  }
  const h = host.toLowerCase();
  if (/(^|[.-])(dev|local|localhost)([.-]|$)/.test(h) || /^(127\.|192\.168\.|10\.)/.test(h)) return "dev";
  if (/(^|[.-])(stg|stage|staging|qa|test)([.-]|$)/.test(h)) return "stage";
  return "prod";
}

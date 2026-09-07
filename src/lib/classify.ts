import type { CapturedRequest } from "./har";

const API_TYPES = new Set(["xhr", "fetch"]);
/** 명확히 API가 아닌 리소스 타입 */
const NON_API_TYPES = new Set([
  "document",
  "stylesheet",
  "image",
  "media",
  "font",
  "script",
  "texttrack",
  "eventsource",
  "websocket",
  "manifest",
  "signedexchange",
  "ping",
  "cspviolationreport",
  "prefetch",
]);
const API_MIME = /json|graphql|xml|x-www-form-urlencoded|protobuf|grpc/i;

/**
 * XHR/fetch 판별. HAR의 _resourceType이 없으면(Chrome이 안 넘겨주는 경우)
 * 요청/응답 헤더로 API 호출인지 추정한다.
 */
export function isApiLike(req: CapturedRequest): boolean {
  const type = req.resourceType.toLowerCase();
  if (API_TYPES.has(type)) return true;
  // CORS preflight는 API 호출의 일부 (실패 시 CORS 원인 파악에 필요)
  if (type === "preflight" || (isPreflight(req) && req.requestHeaders["access-control-request-method"])) return true;
  if (NON_API_TYPES.has(type)) return false;
  const h = req.requestHeaders;
  if (h["x-requested-with"]) return true;
  if (/json|graphql/i.test(h.accept ?? "")) return true;
  if (API_MIME.test(h["content-type"] ?? "")) return true;
  if (API_MIME.test(req.responseHeaders["content-type"] ?? "")) return true;
  return false;
}

export function isDocument(req: CapturedRequest): boolean {
  return req.resourceType.toLowerCase() === "document";
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

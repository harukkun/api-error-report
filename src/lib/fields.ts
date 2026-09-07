import type { CapturedRequest } from "./har";
import { detectEnv } from "./classify";
import { buildCurl } from "./curl";
import { formatBody, formatDate, formatHeaders } from "./format";
import { maskHeaders, maskSecret, SENSITIVE_REQUEST_HEADERS, SENSITIVE_RESPONSE_HEADERS } from "./mask";

export type FieldGroup = "general" | "request" | "response" | "extra";

export interface RenderContext {
  mask: boolean;
  traceHeaders: string[];
  maxBodyLength: number;
}

export interface ReportField {
  id: string;
  group: FieldGroup;
  label: string;
  description?: string;
  defaultOn: boolean;
  kind: "inline" | "block";
  extract: (req: CapturedRequest, ctx: RenderContext) => string | undefined;
}

export const GROUP_LABELS: Record<FieldGroup, string> = {
  general: "General",
  request: "Request",
  response: "Response",
  extra: "Extra",
};

export const GROUP_ORDER: FieldGroup[] = ["general", "request", "response", "extra"];

function requestHeader(req: CapturedRequest, name: string, ctx: RenderContext): string | undefined {
  const v = req.requestHeaders[name];
  if (v === undefined) return undefined;
  return ctx.mask && SENSITIVE_REQUEST_HEADERS.includes(name) ? maskSecret(v) : v;
}

export const FIELDS: ReportField[] = [
  // ── General ──────────────────────────────────────────────
  {
    id: "startedAt",
    group: "general",
    label: "요청 시각",
    defaultOn: false,
    kind: "inline",
    extract: (r) => formatDate(r.startedAt),
  },
  {
    id: "durationMs",
    group: "general",
    label: "소요 시간",
    defaultOn: false,
    kind: "inline",
    extract: (r) => `${r.durationMs}ms`,
  },
  {
    id: "env",
    group: "general",
    label: "환경",
    description: "호스트로 dev/stage/prod 추정",
    defaultOn: false,
    kind: "inline",
    extract: (r) => detectEnv(r.fullUrl),
  },
  {
    id: "pageUrl",
    group: "general",
    label: "페이지 URL",
    defaultOn: false,
    kind: "inline",
    extract: (r) => r.pageUrl || undefined,
  },

  // ── Request ──────────────────────────────────────────────
  {
    id: "url",
    group: "request",
    label: "Request URL",
    defaultOn: true,
    kind: "inline",
    extract: (r) => r.url,
  },
  {
    id: "method",
    group: "request",
    label: "Request Method",
    defaultOn: true,
    kind: "inline",
    extract: (r) => r.method.toUpperCase(),
  },
  {
    id: "query",
    group: "request",
    label: "Query Params",
    defaultOn: false,
    kind: "block",
    extract: (r) => (Object.keys(r.query).length ? JSON.stringify(r.query, null, 2) : undefined),
  },
  {
    id: "authorization",
    group: "request",
    label: "authorization",
    description: "기본 마스킹",
    defaultOn: true,
    kind: "inline",
    extract: (r, ctx) => requestHeader(r, "authorization", ctx),
  },
  {
    id: "userAgent",
    group: "request",
    label: "user-agent",
    defaultOn: true,
    kind: "inline",
    extract: (r, ctx) => requestHeader(r, "user-agent", ctx),
  },
  {
    id: "requestContentType",
    group: "request",
    label: "Content-Type",
    defaultOn: false,
    kind: "inline",
    extract: (r, ctx) => requestHeader(r, "content-type", ctx),
  },
  {
    id: "requestHeadersAll",
    group: "request",
    label: "요청 헤더 전체",
    defaultOn: false,
    kind: "block",
    extract: (r, ctx) =>
      formatHeaders(ctx.mask ? maskHeaders(r.requestHeaders, SENSITIVE_REQUEST_HEADERS) : r.requestHeaders),
  },
  {
    id: "requestBody",
    group: "request",
    label: "Payload",
    defaultOn: true,
    kind: "block",
    extract: (r, ctx) => formatBody(r.requestBody, ctx.maxBodyLength),
  },

  // ── Response ─────────────────────────────────────────────
  {
    id: "status",
    group: "response",
    label: "Status Code",
    defaultOn: true,
    kind: "inline",
    extract: (r) => {
      if (r.status === 0) return "0 (failed)";
      return `${r.status}${r.statusText ? ` ${r.statusText}` : ""}`;
    },
  },
  {
    id: "errorReason",
    group: "response",
    label: "에러 사유",
    description: "네트워크 실패(status 0) 시 사유",
    defaultOn: false,
    kind: "inline",
    extract: (r) => r.errorReason,
  },
  {
    id: "traceHeaders",
    group: "response",
    label: "Trace 헤더",
    description: "설정된 trace 헤더 중 응답에 있는 것",
    defaultOn: false,
    kind: "block",
    extract: (r, ctx) => {
      const lines = ctx.traceHeaders
        .map((h) => h.toLowerCase())
        .filter((h) => r.responseHeaders[h] !== undefined)
        .map((h) => `${h}: ${r.responseHeaders[h]}`);
      return lines.length ? lines.join("\n") : undefined;
    },
  },
  {
    id: "responseHeadersAll",
    group: "response",
    label: "응답 헤더 전체",
    defaultOn: false,
    kind: "block",
    extract: (r, ctx) =>
      formatHeaders(ctx.mask ? maskHeaders(r.responseHeaders, SENSITIVE_RESPONSE_HEADERS) : r.responseHeaders),
  },
  {
    id: "responseBody",
    group: "response",
    label: "Response",
    defaultOn: true,
    kind: "block",
    extract: (r, ctx) => formatBody(r.responseBody, ctx.maxBodyLength),
  },

  // ── Extra ────────────────────────────────────────────────
  {
    id: "curl",
    group: "extra",
    label: "cURL",
    description: "재현용 명령 (마스킹 적용)",
    defaultOn: false,
    kind: "block",
    extract: (r, ctx) => buildCurl(r, { mask: ctx.mask }),
  },
];

export const FIELD_MAP: Record<string, ReportField> = Object.fromEntries(FIELDS.map((f) => [f.id, f]));

export const DEFAULT_FIELD_IDS: string[] = FIELDS.filter((f) => f.defaultOn).map((f) => f.id);

/** 저장된 선택 목록에 새 필드가 추가됐을 때 defaultOn으로 병합 */
export function mergeSelectedFieldIds(saved: string[] | undefined, known: string[] | undefined): string[] {
  if (!saved) return DEFAULT_FIELD_IDS;
  const knownSet = new Set(known ?? saved);
  const savedSet = new Set(saved);
  return FIELDS.filter((f) => (knownSet.has(f.id) ? savedSet.has(f.id) : f.defaultOn)).map((f) => f.id);
}

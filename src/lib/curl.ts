import type { CapturedRequest } from "./har";
import { maskHeaders, SENSITIVE_REQUEST_HEADERS } from "./mask";

const EXCLUDED = new Set([
  "content-length",
  "host",
  "connection",
  "accept-encoding",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
  "te",
  "trailer",
]);

export function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

export function buildCurl(req: CapturedRequest, opts: { mask: boolean }): string {
  const headers = opts.mask ? maskHeaders(req.requestHeaders, SENSITIVE_REQUEST_HEADERS) : req.requestHeaders;
  const body = req.requestBody;
  const multipart = !!body && /multipart\/form-data/i.test(body.mimeType) && !!body.params?.length;
  const parts: string[] = [`curl -X ${req.method.toUpperCase()} ${shellQuote(req.fullUrl)}`];
  for (const key of Object.keys(headers).sort()) {
    if (key.startsWith(":") || EXCLUDED.has(key)) continue;
    // multipart는 -F 가 boundary 포함 content-type을 생성하므로 원본 헤더 제외
    if (multipart && key === "content-type") continue;
    for (const v of headers[key].split("\n")) {
      parts.push(`-H ${shellQuote(`${key}: ${v}`)}`);
    }
  }
  if (multipart && body?.params) {
    for (const p of body.params) {
      const v = p.fileName !== undefined ? `@${p.fileName}` : p.value ?? "";
      parts.push(`-F ${shellQuote(`${p.name}=${v}`)}`);
    }
  } else if (body && body.text) {
    parts.push(`--data-raw ${shellQuote(body.text)}`);
  }
  return parts.join(" \\\n  ");
}

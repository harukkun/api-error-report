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
  const parts: string[] = [`curl -X ${req.method.toUpperCase()} ${shellQuote(req.fullUrl)}`];
  for (const key of Object.keys(headers).sort()) {
    if (key.startsWith(":") || EXCLUDED.has(key)) continue;
    for (const v of headers[key].split("\n")) {
      parts.push(`-H ${shellQuote(`${key}: ${v}`)}`);
    }
  }
  if (req.requestBody && req.requestBody.text) {
    parts.push(`--data-raw ${shellQuote(req.requestBody.text)}`);
  }
  return parts.join(" \\\n  ");
}

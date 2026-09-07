import type { Body, HarPostParam } from "./har";

export function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function truncate(text: string, max: number): string {
  if (max <= 0 || text.length <= max) return text;
  return `${text.slice(0, max)}\n... (truncated, total ${text.length} chars)`;
}

export function isJsonLike(mimeType: string, text: string): boolean {
  if (/json/i.test(mimeType)) return true;
  const t = text.trim();
  return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

export function paramsToObject(params: HarPostParam[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of params) {
    const v = p.fileName !== undefined ? `[file] ${p.fileName}${p.contentType ? ` (${p.contentType})` : ""}` : p.value ?? "";
    out[p.name] = p.name in out ? `${out[p.name]}, ${v}` : v;
  }
  return out;
}

export function isFormUrlencoded(mimeType: string): boolean {
  return /x-www-form-urlencoded/i.test(mimeType);
}

export function formatBody(body: Body | undefined, max: number): string | undefined {
  if (!body) return undefined;
  if (body.encoding === "base64") {
    const bytes = Math.floor((body.text.length * 3) / 4);
    return `[binary ${body.mimeType || "unknown"}, ${bytes} bytes]`;
  }
  if (body.params && body.params.length > 0) {
    return truncate(JSON.stringify(paramsToObject(body.params), null, 2), max);
  }
  if (!body.text.trim()) return undefined;
  if (isFormUrlencoded(body.mimeType)) {
    const obj: Record<string, string> = {};
    new URLSearchParams(body.text).forEach((v, k) => {
      obj[k] = k in obj ? `${obj[k]}, ${v}` : v;
    });
    return truncate(JSON.stringify(obj, null, 2), max);
  }
  const text = isJsonLike(body.mimeType, body.text) ? prettyJson(body.text) : body.text;
  return truncate(text, max);
}

/** 남은/지난 시간을 한국어로. 예: "3시간 12분 남음", "12분 전 만료" */
export function formatRelative(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs;
  const abs = Math.abs(diff);
  const m = Math.floor(abs / 60_000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  let span: string;
  if (d >= 1) span = `${d}일 ${h % 24}시간`;
  else if (h >= 1) span = `${h}시간 ${m % 60}분`;
  else if (m >= 1) span = `${m}분`;
  else span = `${Math.floor(abs / 1000)}초`;
  return diff >= 0 ? `${span} 남음` : `${span} 전 만료`;
}

export function bodyLang(body: Body | undefined): string {
  if (!body) return "";
  if (isJsonLike(body.mimeType, body.text)) return "json";
  if (/html/i.test(body.mimeType)) return "html";
  if (/xml/i.test(body.mimeType)) return "xml";
  return "";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? "+" : "-";
  const tzh = pad(Math.floor(Math.abs(tz) / 60));
  const tzm = pad(Math.abs(tz) % 60);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)} ` +
    `${sign}${tzh}:${tzm}`
  );
}

export function formatHeaders(headers: Record<string, string>): string | undefined {
  const keys = Object.keys(headers).sort();
  if (keys.length === 0) return undefined;
  return keys.map((k) => `${k}: ${headers[k]}`).join("\n");
}

import type { Body } from "./har";

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

export function formatBody(body: Body | undefined, max: number): string | undefined {
  if (!body) return undefined;
  if (body.encoding === "base64") {
    const bytes = Math.floor((body.text.length * 3) / 4);
    return `[binary ${body.mimeType || "unknown"}, ${bytes} bytes]`;
  }
  if (!body.text.trim()) return undefined;
  const text = isJsonLike(body.mimeType, body.text) ? prettyJson(body.text) : body.text;
  return truncate(text, max);
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

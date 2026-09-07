export const SENSITIVE_REQUEST_HEADERS = ["authorization", "cookie", "x-api-key"];
export const SENSITIVE_RESPONSE_HEADERS = ["set-cookie"];

const HEAD = 6;
const TAIL = 4;

/** 토큰 값 마스킹. "Bearer xxx" 형태면 스킴은 유지 */
export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx > 0 && spaceIdx <= 10) {
    const scheme = trimmed.slice(0, spaceIdx);
    const token = trimmed.slice(spaceIdx + 1).trim();
    return `${scheme} ${maskToken(token)}`;
  }
  return maskToken(trimmed);
}

function maskToken(token: string): string {
  if (token.length <= HEAD + TAIL + 2) return "***";
  return `${token.slice(0, HEAD)}...(masked)...${token.slice(-TAIL)}`;
}

export function maskHeaders(
  headers: Record<string, string>,
  sensitive: string[],
): Record<string, string> {
  const set = new Set(sensitive.map((s) => s.toLowerCase()));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = set.has(k) ? v.split("\n").map(maskSecret).join("\n") : v;
  }
  return out;
}

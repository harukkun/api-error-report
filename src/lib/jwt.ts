/** JWT payload 디코드 (서명 검증 없음, 표시 목적) */
export function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const raw = token.trim().replace(/^Bearer\s+/i, "");
  const parts = raw.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const obj: unknown = JSON.parse(json);
    return obj && typeof obj === "object" ? (obj as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

/** exp(초) → ms. 없거나 숫자가 아니면 undefined */
export function jwtExpiryMs(token: string): number | undefined {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : undefined;
}

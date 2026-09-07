import { describe, expect, it } from "vitest";
import { decodeJwtPayload, jwtExpiryMs } from "./jwt";

const b64url = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const token = `${b64url({ alg: "HS256" })}.${b64url({ sub: "u1", exp: 1_800_000_000 })}.sig`;

describe("jwt", () => {
  it("decodes payload with Bearer prefix", () => {
    expect(decodeJwtPayload(`Bearer ${token}`)).toEqual({ sub: "u1", exp: 1_800_000_000 });
  });
  it("returns exp in ms", () => {
    expect(jwtExpiryMs(token)).toBe(1_800_000_000_000);
  });
  it("returns undefined for non-jwt", () => {
    expect(decodeJwtPayload("Bearer opaque-token")).toBeUndefined();
    expect(decodeJwtPayload("a.b.c")).toBeUndefined();
    expect(jwtExpiryMs(`${b64url({})}.${b64url({ sub: "x" })}.s`)).toBeUndefined();
  });
});

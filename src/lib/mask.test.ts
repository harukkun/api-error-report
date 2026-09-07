import { describe, expect, it } from "vitest";
import { maskHeaders, maskSecret } from "./mask";

describe("maskSecret", () => {
  it("keeps Bearer scheme and masks token", () => {
    expect(maskSecret("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.Xk9Q")).toBe("Bearer eyJhbG...(masked)...Xk9Q");
  });
  it("masks Basic credentials", () => {
    expect(maskSecret("Basic dXNlcjpwYXNzd29yZA==")).toBe("Basic dXNlcj...(masked)...ZA==");
  });
  it("fully masks short values", () => {
    expect(maskSecret("Bearer abc")).toBe("Bearer ***");
    expect(maskSecret("short")).toBe("***");
  });
  it("masks schemeless token", () => {
    expect(maskSecret("abcdefghijklmnopqrstuvwxyz")).toBe("abcdef...(masked)...wxyz");
  });
});

describe("maskHeaders", () => {
  it("masks only sensitive keys, per line", () => {
    const out = maskHeaders(
      { authorization: "Bearer abcdefghijklmnopqrstuvwxyz", cookie: "a=1234567890abcdef\nb=2", "user-agent": "UA" },
      ["authorization", "cookie"],
    );
    expect(out.authorization).toBe("Bearer abcdef...(masked)...wxyz");
    expect(out.cookie).toBe("a=1234...(masked)...cdef\n***");
    expect(out["user-agent"]).toBe("UA");
  });
});

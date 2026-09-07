import { describe, expect, it } from "vitest";
import { buildCurl, shellQuote } from "./curl";
import { makeRequest } from "./fixtures.test-helper";

describe("shellQuote", () => {
  it("escapes single quotes", () => {
    expect(shellQuote("it's")).toBe(`'it'\\''s'`);
  });
});

describe("buildCurl", () => {
  it("includes method, full url, headers, body and excludes hop-by-hop headers", () => {
    const curl = buildCurl(makeRequest(), { mask: false });
    expect(curl).toContain("curl -X POST 'https://api.example.com/user/v4/withdrawal?force=true&reason=test'");
    expect(curl).toContain("-H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdefXk9Q'");
    expect(curl).toContain(`--data-raw '{"userId":1,"reason":"bye"}'`);
    expect(curl).not.toContain("content-length");
    expect(curl).not.toContain("host:");
  });
  it("masks authorization when requested", () => {
    const curl = buildCurl(makeRequest(), { mask: true });
    expect(curl).toContain("-H 'authorization: Bearer eyJhbG...(masked)...Xk9Q'");
  });
  it("omits body for GET without payload", () => {
    const curl = buildCurl(makeRequest({ method: "GET", requestBody: undefined }), { mask: true });
    expect(curl).not.toContain("--data-raw");
  });
});

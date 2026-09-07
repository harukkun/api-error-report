import { describe, expect, it } from "vitest";
import { DEFAULT_FIELD_IDS, FIELDS, mergeSelectedFieldIds } from "./fields";
import { makeRequest } from "./fixtures.test-helper";
import { buildReport } from "./report";
import { DEFAULT_TRACE_HEADERS } from "./defaults";

const ctx = { mask: true, traceHeaders: DEFAULT_TRACE_HEADERS, maxBodyLength: 10_000 };

describe("DEFAULT_FIELD_IDS", () => {
  it("is exactly the 7 originally requested fields", () => {
    expect(DEFAULT_FIELD_IDS).toEqual(["url", "method", "authorization", "userAgent", "requestBody", "status", "responseBody"]);
  });
  it("has unique ids", () => {
    expect(new Set(FIELDS.map((f) => f.id)).size).toBe(FIELDS.length);
  });
});

describe("buildReport", () => {
  it("renders default fields with masked authorization", () => {
    const md = buildReport(makeRequest(), DEFAULT_FIELD_IDS, ctx);
    expect(md.startsWith("🚨 API 에러 정보\n\n[Request]\n")).toBe(true);
    expect(md).toContain("Request URL: https://api.example.com/user/v4/withdrawal\nRequest Method: POST\n");
    expect(md).toContain("authorization: Bearer eyJhbG...(masked)...Xk9Q\nuser-agent: Mozilla/5.0 Chrome/140\n\nPayload:\n{\n  \"userId\": 1,");
    expect(md).toContain("\n\n[Response]\nStatus Code: 500 Internal Server Error\n\nResponse:\n{");
    expect(md).toContain('"path": "/user/v4/withdrawal"');
    expect(md).not.toMatch(/[`*#]{1}/);
    // non-default fields absent
    expect(md).not.toContain("요청 시각");
    expect(md).not.toContain("cURL");
    expect(md).not.toContain("x-request-id");
  });

  it("adds fields when selected", () => {
    const md = buildReport(makeRequest(), [...DEFAULT_FIELD_IDS, "startedAt", "traceHeaders", "curl", "query"], ctx);
    expect(md).toContain("🚨 API 에러 정보\n\n요청 시각: 2026-09-07");
    expect(md).toContain("Trace 헤더:\nx-request-id: req-123");
    expect(md).toContain("[Extra]\ncURL:\ncurl -X POST");
    expect(md).toContain('Query Params:\n{\n  "force": "true"');
  });

  it("omits fields with no value and empty groups", () => {
    const md = buildReport(
      makeRequest({ requestBody: undefined, responseBody: undefined, responseHeaders: {}, requestHeaders: {} }),
      ["authorization", "requestBody", "traceHeaders", "responseBody", "curl"],
      ctx,
    );
    expect(md).not.toContain("[Request]");
    expect(md).not.toContain("[Response]");
    expect(md).toContain("[Extra]");
  });

  it("unmasks when mask=false", () => {
    const md = buildReport(makeRequest(), ["authorization"], { ...ctx, mask: false });
    expect(md).toContain("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdefXk9Q");
  });

  it("shows failed status and reason", () => {
    const md = buildReport(makeRequest({ status: 0, statusText: "", errorReason: "net::ERR_FAILED" }), ["status", "errorReason"], ctx);
    expect(md).toContain("Status Code: 0 (failed)\n에러 사유: net::ERR_FAILED");
  });
});

describe("mergeSelectedFieldIds", () => {
  it("returns defaults when nothing saved", () => {
    expect(mergeSelectedFieldIds(undefined, undefined)).toEqual(DEFAULT_FIELD_IDS);
  });
  it("keeps saved choices for known fields and defaults for new ones", () => {
    const known = ["url", "method"];
    expect(mergeSelectedFieldIds(["url"], known)).toEqual(["url", "authorization", "userAgent", "requestBody", "status", "responseBody"]);
  });
  it("preserves registry order", () => {
    expect(mergeSelectedFieldIds(["curl", "url"], FIELDS.map((f) => f.id))).toEqual(["url", "curl"]);
  });
});

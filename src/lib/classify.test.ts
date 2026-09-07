import { describe, expect, it } from "vitest";
import { detectEnv, isApiLike, isDocument, isError, isPreflight, statusTone } from "./classify";
import { makeRequest } from "./fixtures.test-helper";

describe("classify", () => {
  it("detects xhr/fetch by resourceType", () => {
    expect(isApiLike(makeRequest({ resourceType: "xhr" }))).toBe(true);
    expect(isApiLike(makeRequest({ resourceType: "Fetch" }))).toBe(true);
    expect(isApiLike(makeRequest({ resourceType: "image", requestHeaders: { accept: "application/json" } }))).toBe(false);
    expect(isApiLike(makeRequest({ resourceType: "document", responseHeaders: { "content-type": "application/json" } }))).toBe(false);
  });
  it("falls back to headers when resourceType is missing", () => {
    const noType = { resourceType: "", requestHeaders: {}, responseHeaders: {} };
    expect(isApiLike(makeRequest({ ...noType, requestHeaders: { accept: "application/json, text/plain" } }))).toBe(true);
    expect(isApiLike(makeRequest({ ...noType, requestHeaders: { "x-requested-with": "XMLHttpRequest" } }))).toBe(true);
    expect(isApiLike(makeRequest({ ...noType, responseHeaders: { "content-type": "application/json; charset=utf-8" } }))).toBe(true);
    expect(isApiLike(makeRequest({ ...noType, requestHeaders: { "content-type": "application/x-www-form-urlencoded" } }))).toBe(true);
    expect(isApiLike(makeRequest({ ...noType, requestHeaders: { accept: "text/html" }, responseHeaders: { "content-type": "text/html" } }))).toBe(false);
    expect(isApiLike(makeRequest({ ...noType, resourceType: "other", requestHeaders: { accept: "*/*" } }))).toBe(false);
  });
  it("treats CORS preflight as API-like", () => {
    expect(isApiLike(makeRequest({ resourceType: "preflight", method: "OPTIONS", requestHeaders: {} }))).toBe(true);
    expect(isApiLike(makeRequest({ resourceType: "", method: "OPTIONS", requestHeaders: { "access-control-request-method": "POST" }, responseHeaders: {} }))).toBe(true);
  });
  it("detects document", () => {
    expect(isDocument(makeRequest({ resourceType: "document" }))).toBe(true);
    expect(isDocument(makeRequest({ resourceType: "fetch" }))).toBe(false);
  });
  it("treats status 0 and >=400 as error", () => {
    expect(isError(makeRequest({ status: 0 }))).toBe(true);
    expect(isError(makeRequest({ status: 404 }))).toBe(true);
    expect(isError(makeRequest({ status: 200 }))).toBe(false);
  });
  it("detects preflight", () => {
    expect(isPreflight(makeRequest({ method: "OPTIONS" }))).toBe(true);
    expect(isPreflight(makeRequest({ method: "POST" }))).toBe(false);
  });
  it("status tone", () => {
    expect(statusTone(0)).toBe("error");
    expect(statusTone(503)).toBe("error");
    expect(statusTone(401)).toBe("warn");
    expect(statusTone(200)).toBe("ok");
  });
  it("detects env by host", () => {
    expect(detectEnv("https://dev-api.example.com/x")).toBe("dev");
    expect(detectEnv("http://localhost:3000/x")).toBe("dev");
    expect(detectEnv("https://api.stg.example.com/x")).toBe("stage");
    expect(detectEnv("https://qa-api.example.com/x")).toBe("stage");
    expect(detectEnv("https://api.example.com/x")).toBe("prod");
  });
});

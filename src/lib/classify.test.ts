import { describe, expect, it } from "vitest";
import { detectEnv, isError, isPreflight, isXhrLike, statusTone } from "./classify";
import { makeRequest } from "./fixtures.test-helper";

describe("classify", () => {
  it("detects xhr/fetch", () => {
    expect(isXhrLike(makeRequest({ resourceType: "xhr" }))).toBe(true);
    expect(isXhrLike(makeRequest({ resourceType: "Fetch" }))).toBe(true);
    expect(isXhrLike(makeRequest({ resourceType: "image" }))).toBe(false);
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

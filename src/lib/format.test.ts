import { describe, expect, it } from "vitest";
import { formatBody, prettyJson, truncate } from "./format";

describe("prettyJson", () => {
  it("pretty prints valid json", () => {
    expect(prettyJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  });
  it("returns original for invalid json", () => {
    expect(prettyJson("<html>")).toBe("<html>");
  });
});

describe("truncate", () => {
  it("appends note when over max", () => {
    expect(truncate("abcdef", 3)).toBe("abc\n... (truncated, total 6 chars)");
  });
  it("leaves short text alone", () => {
    expect(truncate("abc", 10)).toBe("abc");
  });
});

describe("formatBody", () => {
  it("handles base64 binary", () => {
    expect(formatBody({ mimeType: "image/png", text: "AAAA", encoding: "base64" }, 100)).toBe("[binary image/png, 3 bytes]");
  });
  it("returns undefined for empty body", () => {
    expect(formatBody({ mimeType: "text/plain", text: "   " }, 100)).toBeUndefined();
    expect(formatBody(undefined, 100)).toBeUndefined();
  });
  it("pretty prints json by mime", () => {
    expect(formatBody({ mimeType: "application/json; charset=utf-8", text: '{"a":1}' }, 100)).toBe('{\n  "a": 1\n}');
  });
});

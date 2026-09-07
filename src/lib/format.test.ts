import { describe, expect, it } from "vitest";
import { formatBody, formatRelative, prettyJson, truncate } from "./format";

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

describe("formatBody form payloads", () => {
  it("renders params as object with file markers", () => {
    const out = formatBody(
      { mimeType: "multipart/form-data", text: "", params: [{ name: "id", value: "1" }, { name: "photo", fileName: "a.jpg", contentType: "image/jpeg" }] },
      1000,
    );
    expect(out).toBe('{\n  "id": "1",\n  "photo": "[file] a.jpg (image/jpeg)"\n}');
  });
  it("parses urlencoded text", () => {
    expect(formatBody({ mimeType: "application/x-www-form-urlencoded", text: "a=1&b=x%20y" }, 1000)).toBe('{\n  "a": "1",\n  "b": "x y"\n}');
  });
});

describe("formatRelative", () => {
  const now = 1_000_000_000_000;
  it("future", () => {
    expect(formatRelative(now + 42 * 60_000, now)).toBe("42분 남음");
    expect(formatRelative(now + (3 * 60 + 12) * 60_000, now)).toBe("3시간 12분 남음");
    expect(formatRelative(now + 26 * 3_600_000, now)).toBe("1일 2시간 남음");
  });
  it("past", () => {
    expect(formatRelative(now - 12 * 60_000, now)).toBe("12분 전 만료");
    expect(formatRelative(now - 30_000, now)).toBe("30초 전 만료");
  });
});

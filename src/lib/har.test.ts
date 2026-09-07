import { describe, expect, it } from "vitest";
import { fromHarEntry, headersToRecord, splitUrl } from "./har";

describe("splitUrl", () => {
  it("separates query", () => {
    expect(splitUrl("https://a.com/p?x=1&y=2")).toEqual({ url: "https://a.com/p", query: { x: "1", y: "2" } });
  });
});

describe("headersToRecord", () => {
  it("lowercases and merges duplicates", () => {
    expect(
      headersToRecord([
        { name: "Set-Cookie", value: "a=1" },
        { name: "set-cookie", value: "b=2" },
      ]),
    ).toEqual({ "set-cookie": "a=1\nb=2" });
  });
});

describe("fromHarEntry", () => {
  it("maps HAR entry", () => {
    const req = fromHarEntry(
      {
        startedDateTime: "2026-09-07T02:00:00.000Z",
        time: 123.7,
        request: {
          method: "post",
          url: "https://a.com/p?x=1",
          headers: [{ name: "Authorization", value: "Bearer t" }],
          postData: { mimeType: "application/json", text: "{}" },
        },
        response: { status: 0, statusText: "", headers: [], content: { size: 0, mimeType: "x-unknown" } },
        _resourceType: "fetch",
        _error: "net::ERR_FAILED",
      },
      "id1",
      "https://a.com/",
    );
    expect(req.durationMs).toBe(124);
    expect(req.url).toBe("https://a.com/p");
    expect(req.query).toEqual({ x: "1" });
    expect(req.requestHeaders.authorization).toBe("Bearer t");
    expect(req.requestBody).toEqual({ mimeType: "application/json", text: "{}" });
    expect(req.errorReason).toBe("net::ERR_FAILED");
    expect(req.resourceType).toBe("fetch");
  });
});

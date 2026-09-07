import { describe, expect, it } from "vitest";
import { FAILED_NO_REASON, fromHarEntry, headersToRecord, splitUrl, type HarEntry } from "./har";

const baseEntry = (over: Partial<HarEntry["request"]> = {}, resp: Partial<HarEntry["response"]> = {}, extra: Partial<HarEntry> = {}): HarEntry => ({
  startedDateTime: "2026-09-07T02:00:00.000Z",
  time: 10,
  request: { method: "POST", url: "https://a.com/p", headers: [], ...over },
  response: { status: 200, statusText: "OK", headers: [], content: { size: 0, mimeType: "application/json" }, ...resp },
  ...extra,
});

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

  it("error reason fallback chain", () => {
    expect(fromHarEntry(baseEntry({}, { status: 0, _error: "net::ERR_CONNECTION_REFUSED" }), "1", "").errorReason).toBe("net::ERR_CONNECTION_REFUSED");
    expect(fromHarEntry(baseEntry({}, { status: 0 }), "1", "").errorReason).toBe(FAILED_NO_REASON);
    expect(fromHarEntry(baseEntry({}, { status: 500 }), "1", "").errorReason).toBeUndefined();
  });

  it("missing _resourceType becomes empty string", () => {
    expect(fromHarEntry(baseEntry(), "1", "").resourceType).toBe("");
  });

  it("maps form params and synthesizes urlencoded text", () => {
    const req = fromHarEntry(
      baseEntry({
        postData: {
          mimeType: "application/x-www-form-urlencoded",
          params: [{ name: "a", value: "1" }, { name: "b c", value: "x&y" }],
        },
      }),
      "1",
      "",
    );
    expect(req.requestBody?.params).toHaveLength(2);
    expect(req.requestBody?.text).toBe("a=1&b%20c=x%26y");
  });

  it("keeps multipart params without text", () => {
    const req = fromHarEntry(
      baseEntry({
        postData: {
          mimeType: "multipart/form-data; boundary=x",
          params: [{ name: "file", fileName: "a.jpg", contentType: "image/jpeg" }],
        },
      }),
      "1",
      "",
    );
    expect(req.requestBody?.text).toBe("");
    expect(req.requestBody?.params?.[0].fileName).toBe("a.jpg");
  });
});

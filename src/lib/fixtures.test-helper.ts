import type { CapturedRequest } from "./har";

export function makeRequest(overrides: Partial<CapturedRequest> = {}): CapturedRequest {
  return {
    id: "1",
    startedAt: "2026-09-07T02:05:22.293Z",
    durationMs: 812,
    method: "POST",
    url: "https://api.example.com/user/v4/withdrawal",
    fullUrl: "https://api.example.com/user/v4/withdrawal?force=true&reason=test",
    query: { force: "true", reason: "test" },
    status: 500,
    statusText: "Internal Server Error",
    resourceType: "fetch",
    requestHeaders: {
      authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdefXk9Q",
      "user-agent": "Mozilla/5.0 Chrome/140",
      "content-type": "application/json",
      "content-length": "42",
      host: "api.example.com",
    },
    responseHeaders: {
      "content-type": "application/json",
      "x-request-id": "req-123",
    },
    requestBody: { mimeType: "application/json", text: '{"userId":1,"reason":"bye"}' },
    responseBody: {
      mimeType: "application/json",
      text: '{"timestamp":"2026-09-07T11:05:22.293+09:00","status":500,"error":"Internal Server Error","path":"/user/v4/withdrawal"}',
    },
    pageUrl: "https://www.example.com/mypage",
    ...overrides,
  };
}

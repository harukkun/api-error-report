import type { CapturedRequest } from "../lib/har";

/** exp가 지금부터 42분 뒤인 가짜 JWT (서명은 무의미) */
function mockJwt(): string {
  const b64url = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const exp = Math.floor(Date.now() / 1000) + 42 * 60;
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: "1234567890", exp })}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
}

/** 확장 밖(vite dev)에서 UI 확인용 목 데이터 */
export function mockRequests(): CapturedRequest[] {
  const base = {
    startedAt: new Date().toISOString(),
    resourceType: "fetch",
    pageUrl: "https://www.example.com/mypage",
    requestHeaders: {
      authorization: `Bearer ${mockJwt()}`,
      "user-agent": navigator.userAgent,
      "content-type": "application/json",
      accept: "application/json",
    },
  };
  return [
    {
      ...base,
      id: "m1",
      method: "GET",
      url: "https://api.example.com/user/v4/profile",
      fullUrl: "https://api.example.com/user/v4/profile",
      query: {},
      status: 200,
      statusText: "OK",
      durationMs: 120,
      responseHeaders: { "content-type": "application/json", "x-request-id": "req-ok-1" },
      responseBody: { mimeType: "application/json", text: '{"id":1,"name":"sangzin"}' },
    },
    {
      ...base,
      id: "m2",
      method: "POST",
      url: "https://api.example.com/user/v4/withdrawal",
      fullUrl: "https://api.example.com/user/v4/withdrawal?force=true",
      query: { force: "true" },
      status: 500,
      statusText: "Internal Server Error",
      durationMs: 812,
      requestBody: { mimeType: "application/json", text: '{"userId":1,"reason":"bye"}' },
      responseHeaders: { "content-type": "application/json", "x-request-id": "req-err-2", "x-b3-traceid": "abc123" },
      responseBody: {
        mimeType: "application/json",
        text: '{"timestamp":"2026-09-07T11:05:22.293+09:00","status":500,"error":"Internal Server Error","path":"/user/v4/withdrawal"}',
      },
    },
    {
      ...base,
      id: "m3",
      method: "GET",
      url: "https://dev-api.example.com/order/v2/list",
      fullUrl: "https://dev-api.example.com/order/v2/list?page=1&size=20",
      query: { page: "1", size: "20" },
      status: 401,
      statusText: "Unauthorized",
      durationMs: 45,
      responseHeaders: { "content-type": "application/json" },
      responseBody: { mimeType: "application/json", text: '{"code":"AUTH_EXPIRED","message":"토큰이 만료되었습니다"}' },
    },
    {
      ...base,
      id: "m4",
      method: "POST",
      url: "https://api.example.com/payment/v1/confirm",
      fullUrl: "https://api.example.com/payment/v1/confirm",
      query: {},
      status: 0,
      statusText: "",
      errorReason: "net::ERR_FAILED",
      durationMs: 30012,
      requestBody: { mimeType: "application/json", text: '{"orderId":"O-1"}' },
      responseHeaders: {},
    },
    {
      // _resourceType 없음 → accept 헤더로 API 추정되어야 함
      ...base,
      id: "m6",
      resourceType: "",
      method: "GET",
      url: "https://api.example.com/search/v1/items",
      fullUrl: "https://api.example.com/search/v1/items?q=car",
      query: { q: "car" },
      status: 502,
      statusText: "Bad Gateway",
      durationMs: 3021,
      responseHeaders: { "content-type": "text/html" },
      responseBody: { mimeType: "text/html", text: "<html><body><h1>502 Bad Gateway</h1></body></html>" },
    },
    {
      // multipart 업로드 실패
      ...base,
      id: "m7",
      method: "POST",
      url: "https://api.example.com/upload/v1/photo",
      fullUrl: "https://api.example.com/upload/v1/photo",
      query: {},
      status: 413,
      statusText: "Payload Too Large",
      durationMs: 950,
      requestHeaders: { ...base.requestHeaders, "content-type": "multipart/form-data; boundary=----X" },
      requestBody: {
        mimeType: "multipart/form-data; boundary=----X",
        text: "",
        params: [
          { name: "carId", value: "12345" },
          { name: "photo", fileName: "front.jpg", contentType: "image/jpeg" },
        ],
      },
      responseHeaders: { "content-type": "application/json" },
      responseBody: { mimeType: "application/json", text: '{"code":"FILE_TOO_LARGE","limit":"10MB"}' },
    },
    {
      // 실패한 preflight → 숨김 설정과 무관하게 표시되어야 함
      ...base,
      id: "m8",
      resourceType: "preflight",
      method: "OPTIONS",
      url: "https://api.other.com/v1/quote",
      fullUrl: "https://api.other.com/v1/quote",
      query: {},
      status: 0,
      statusText: "",
      errorReason: "net::ERR_FAILED (CORS preflight)",
      durationMs: 12,
      requestHeaders: { "access-control-request-method": "POST", origin: "https://www.example.com" },
      responseHeaders: {},
    },
    {
      // SSR 페이지 500 → document지만 에러이므로 표시
      ...base,
      id: "m9",
      resourceType: "document",
      method: "GET",
      url: "https://www.example.com/mypage",
      fullUrl: "https://www.example.com/mypage",
      query: {},
      status: 500,
      statusText: "Internal Server Error",
      durationMs: 210,
      requestHeaders: { "user-agent": navigator.userAgent, accept: "text/html" },
      responseHeaders: { "content-type": "text/html" },
      responseBody: { mimeType: "text/html", text: "<!doctype html><title>500</title>" },
    },
    {
      ...base,
      id: "m5",
      resourceType: "image",
      method: "GET",
      url: "https://cdn.example.com/logo.png",
      fullUrl: "https://cdn.example.com/logo.png",
      query: {},
      status: 200,
      statusText: "OK",
      durationMs: 20,
      responseHeaders: { "content-type": "image/png" },
      responseBody: { mimeType: "image/png", text: "iVBORw0KGgo=", encoding: "base64" },
    },
  ];
}

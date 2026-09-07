/** Chrome DevTools HAR entry 중 우리가 사용하는 최소 형태 */
export interface HarHeader {
  name: string;
  value: string;
}

export interface HarEntry {
  startedDateTime: string;
  time: number;
  request: {
    method: string;
    url: string;
    headers: HarHeader[];
    queryString?: { name: string; value: string }[];
    postData?: { mimeType: string; text?: string; params?: HarPostParam[] };
  };
  response: {
    status: number;
    statusText: string;
    headers: HarHeader[];
    content: { size: number; mimeType: string };
    _error?: string;
  };
  _resourceType?: string;
  _error?: string;
}

export interface HarPostParam {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
}

export interface Body {
  mimeType: string;
  text: string;
  encoding?: string;
  /** form(urlencoded/multipart) 페이로드. HAR postData.params */
  params?: HarPostParam[];
}

export interface CapturedRequest {
  id: string;
  startedAt: string;
  durationMs: number;
  method: string;
  /** 쿼리 제외 URL */
  url: string;
  /** 쿼리 포함 원본 URL */
  fullUrl: string;
  query: Record<string, string>;
  status: number;
  statusText: string;
  errorReason?: string;
  /** HAR _resourceType(소문자). 없으면 "" → 헤더로 API 여부 추정 */
  resourceType: string;
  /** 키는 소문자 */
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: Body;
  responseBody?: Body;
  pageUrl: string;
}

export function headersToRecord(headers: HarHeader[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of headers) {
    const key = h.name.toLowerCase();
    // set-cookie 등 중복 헤더는 줄바꿈으로 합침
    out[key] = key in out ? `${out[key]}\n${h.value}` : h.value;
  }
  return out;
}

export function splitUrl(fullUrl: string): { url: string; query: Record<string, string> } {
  try {
    const u = new URL(fullUrl);
    const query: Record<string, string> = {};
    u.searchParams.forEach((v, k) => {
      query[k] = k in query ? `${query[k]}, ${v}` : v;
    });
    return { url: `${u.origin}${u.pathname}`, query };
  } catch {
    const idx = fullUrl.indexOf("?");
    return { url: idx >= 0 ? fullUrl.slice(0, idx) : fullUrl, query: {} };
  }
}

export const FAILED_NO_REASON = "요청 실패 (사유 미제공)";

function toRequestBody(post: HarEntry["request"]["postData"]): Body | undefined {
  if (!post) return undefined;
  const params = post.params && post.params.length > 0 ? post.params : undefined;
  let text = post.text ?? "";
  if (!text && params && /x-www-form-urlencoded/i.test(post.mimeType)) {
    text = params.map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value ?? "")}`).join("&");
  }
  if (!text && !params) return undefined;
  return { mimeType: post.mimeType, text, params };
}

function toErrorReason(entry: HarEntry): string | undefined {
  return entry._error || entry.response._error || (entry.response.status === 0 ? FAILED_NO_REASON : undefined);
}

export function fromHarEntry(entry: HarEntry, id: string, pageUrl: string): CapturedRequest {
  const { url, query } = splitUrl(entry.request.url);
  return {
    id,
    startedAt: entry.startedDateTime,
    durationMs: Math.round(entry.time),
    method: entry.request.method,
    url,
    fullUrl: entry.request.url,
    query,
    status: entry.response.status,
    statusText: entry.response.statusText,
    errorReason: toErrorReason(entry),
    resourceType: (entry._resourceType ?? "").toLowerCase(),
    requestHeaders: headersToRecord(entry.request.headers),
    responseHeaders: headersToRecord(entry.response.headers),
    requestBody: toRequestBody(entry.request.postData),
    responseBody: undefined,
    pageUrl,
  };
}

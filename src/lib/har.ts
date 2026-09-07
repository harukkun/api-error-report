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
    postData?: { mimeType: string; text?: string };
  };
  response: {
    status: number;
    statusText: string;
    headers: HarHeader[];
    content: { size: number; mimeType: string };
  };
  _resourceType?: string;
  _error?: string;
}

export interface Body {
  mimeType: string;
  text: string;
  encoding?: string;
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

export function fromHarEntry(entry: HarEntry, id: string, pageUrl: string): CapturedRequest {
  const { url, query } = splitUrl(entry.request.url);
  const post = entry.request.postData;
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
    errorReason: entry._error || undefined,
    resourceType: entry._resourceType ?? "other",
    requestHeaders: headersToRecord(entry.request.headers),
    responseHeaders: headersToRecord(entry.response.headers),
    requestBody: post && post.text !== undefined ? { mimeType: post.mimeType, text: post.text } : undefined,
    responseBody: undefined,
    pageUrl,
  };
}

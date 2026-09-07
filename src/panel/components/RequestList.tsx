import type { CapturedRequest } from "../../lib/har";
import { statusTone } from "../../lib/classify";

interface Props {
  requests: CapturedRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

export function RequestList({ requests, selectedId, onSelect }: Props) {
  if (requests.length === 0) {
    return <div className="empty">표시할 요청이 없습니다. 페이지에서 요청을 발생시키거나 필터를 조정하세요.</div>;
  }
  return (
    <ul className="req-list" role="listbox" aria-label="네트워크 요청">
      {requests.map((r) => (
        <li
          key={r.id}
          role="option"
          aria-selected={r.id === selectedId}
          className={`req-row ${r.id === selectedId ? "selected" : ""}`}
          onClick={() => onSelect(r.id)}
          title={r.fullUrl}
        >
          <span className={`status tone-${statusTone(r.status)}`}>{r.status === 0 ? "ERR" : r.status}</span>
          <span className="method">{r.method.toUpperCase()}</span>
          <span className="path">
            <span className="path-main">{pathOf(r.url)}</span>
            <span className="path-host">{hostOf(r.url)}</span>
          </span>
          <span className="duration">{r.durationMs}ms</span>
        </li>
      ))}
    </ul>
  );
}

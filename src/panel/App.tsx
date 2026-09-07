import { useEffect, useMemo, useState } from "react";
import { isError, isPreflight, isXhrLike } from "../lib/classify";
import { buildReport } from "../lib/report";
import { FieldPicker } from "./components/FieldPicker";
import { ReportPreview } from "./components/ReportPreview";
import { RequestDetail } from "./components/RequestDetail";
import { RequestList } from "./components/RequestList";
import { SettingsPanel } from "./components/SettingsPanel";
import { useNetworkCapture } from "./hooks/useNetworkCapture";
import { useSettings } from "./hooks/useSettings";

type View = "report" | "detail" | "settings";

export function App() {
  const { settings, update, reset } = useSettings();
  const { requests, clear, isLive } = useNetworkCapture(settings?.preserveLog ?? false);

  const [errorsOnly, setErrorsOnly] = useState<boolean | null>(null);
  const [xhrOnly, setXhrOnly] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("report");
  const [mask, setMask] = useState(true);
  const [showFields, setShowFields] = useState(true);

  const effErrorsOnly = errorsOnly ?? settings?.errorsOnlyDefault ?? true;
  const effXhrOnly = xhrOnly ?? settings?.xhrOnlyDefault ?? true;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (settings?.hidePreflight && isPreflight(r)) return false;
      if (effXhrOnly && !isXhrLike(r)) return false;
      if (effErrorsOnly && !isError(r)) return false;
      if (q && !r.fullUrl.toLowerCase().includes(q) && !r.method.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [requests, settings?.hidePreflight, effXhrOnly, effErrorsOnly, search]);

  const selected = useMemo(() => requests.find((r) => r.id === selectedId) ?? null, [requests, selectedId]);

  // 설정의 기본 마스킹 값이 바뀌면 반영
  useEffect(() => {
    setMask(settings?.maskByDefault ?? true);
  }, [settings?.maskByDefault]);

  // 요청을 바꾸면 항상 마스킹 기본값으로 리셋 (토큰 원문 유출 실수 방지)
  const selectRequest = (id: string) => {
    setSelectedId(id);
    setMask(settings?.maskByDefault ?? true);
  };

  const markdown = useMemo(() => {
    if (!selected || !settings) return "";
    return buildReport(selected, settings.selectedFieldIds, {
      mask,
      traceHeaders: settings.traceHeaders,
      maxBodyLength: settings.maxBodyLength,
    });
  }, [selected, settings, mask]);

  if (!settings) return <div className="empty">설정 불러오는 중…</div>;

  return (
    <div className="app">
      <aside className="left">
        <div className="toolbar">
          <input
            className="search"
            placeholder="URL 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="URL 검색"
          />
          <label className="toggle">
            <input type="checkbox" checked={effErrorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} />
            에러만
          </label>
          <label className="toggle">
            <input type="checkbox" checked={effXhrOnly} onChange={(e) => setXhrOnly(e.target.checked)} />
            XHR/fetch만
          </label>
          <button className="icon" title="목록 지우기" onClick={clear} aria-label="목록 지우기">
            🚫
          </button>
        </div>
        <RequestList requests={filtered} selectedId={selectedId} onSelect={selectRequest} />
        <div className="left-foot">
          {filtered.length} / {requests.length} 요청{isLive ? "" : " · 미리보기 목 데이터"}
        </div>
      </aside>

      <main className="right">
        <div className="right-head">
          <div className="tabs">
            <button className={`tab ${view === "report" ? "active" : ""}`} onClick={() => setView("report")}>
              리포트
            </button>
            <button className={`tab ${view === "detail" ? "active" : ""}`} onClick={() => setView("detail")} disabled={!selected}>
              원본
            </button>
            <button className={`tab ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")}>
              설정
            </button>
          </div>
          {view === "report" && (
            <button className="link" onClick={() => setShowFields((v) => !v)}>
              {showFields ? "필드 숨기기" : "필드 표시"}
            </button>
          )}
        </div>

        {view === "settings" && <SettingsPanel settings={settings} onChange={update} onReset={reset} />}

        {view === "detail" && selected && <RequestDetail req={selected} mask={mask} />}

        {view === "report" && (
          <div className="report-layout">
            {selected ? (
              <ReportPreview markdown={markdown} mask={mask} onMaskChange={setMask} requestKey={selected.id} />
            ) : (
              <div className="empty">왼쪽 목록에서 요청을 선택하세요.</div>
            )}
            {showFields && (
              <FieldPicker selected={settings.selectedFieldIds} onChange={(ids) => update({ selectedFieldIds: ids })} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

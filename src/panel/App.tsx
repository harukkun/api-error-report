import { useEffect, useMemo, useRef, useState } from "react";
import { isApiLike, isDocument, isError, isPreflight } from "../lib/classify";
import { buildReport } from "../lib/report";
import { FieldPicker } from "./components/FieldPicker";
import { ReportPreview } from "./components/ReportPreview";
import { RequestDetail } from "./components/RequestDetail";
import { RequestList } from "./components/RequestList";
import { SettingsPanel } from "./components/SettingsPanel";
import { useExtensionAlive } from "./hooks/useExtensionAlive";
import { useNetworkCapture } from "./hooks/useNetworkCapture";
import { useSettings } from "./hooks/useSettings";

type View = "report" | "detail" | "settings";

/** 스토어 스크린샷용 데모 모드. 확장 밖 목 데이터일 때 ?demo=1 로 활성화 */
const DEMO = {
  requestId: "m2",
  memo: "마이페이지 > 회원탈퇴 버튼 클릭 시 발생",
  extraFields: ["startedAt", "tokenExpiry", "traceHeaders"],
};

export function App() {
  const { settings, update, reset } = useSettings();
  const extensionAlive = useExtensionAlive();
  const { requests, clear, isLive } = useNetworkCapture(settings?.preserveLog ?? false);

  const [errorsOnly, setErrorsOnly] = useState<boolean | null>(null);
  const [xhrOnly, setXhrOnly] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("report");
  const [mask, setMask] = useState(true);
  const [showFields, setShowFields] = useState(true);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [demoFieldIds, setDemoFieldIds] = useState<string[] | null>(null);
  const demoApplied = useRef(false);
  const isDemo = !isLive && new URLSearchParams(window.location.search).has("demo");

  useEffect(() => {
    if (!isDemo || !settings || demoApplied.current) return;
    demoApplied.current = true;
    setSelectedId(DEMO.requestId);
    setMemos({ [DEMO.requestId]: DEMO.memo });
    setDemoFieldIds(Array.from(new Set([...settings.selectedFieldIds, ...DEMO.extraFields])));
  }, [isDemo, settings]);

  const effErrorsOnly = errorsOnly ?? settings?.errorsOnlyDefault ?? true;
  const effXhrOnly = xhrOnly ?? settings?.xhrOnlyDefault ?? true;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      // 성공한 preflight만 숨김. 실패한 OPTIONS는 CORS 원인이므로 항상 표시
      if (settings?.hidePreflight && isPreflight(r) && !isError(r)) return false;
      // API 요청 + 에러난 페이지(document) 요청
      if (effXhrOnly && !(isApiLike(r) || (isDocument(r) && isError(r)))) return false;
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

  const memo = selected ? memos[selected.id] ?? "" : "";
  const setMemo = (text: string) => {
    if (!selected) return;
    setMemos((prev) => ({ ...prev, [selected.id]: text }));
  };
  const clearAll = () => {
    clear();
    setMemos({});
    setSelectedId(null);
  };

  const fieldIds = demoFieldIds ?? settings?.selectedFieldIds ?? [];

  const report = useMemo(() => {
    if (!selected || !settings) return "";
    return buildReport(
      selected,
      fieldIds,
      { mask, traceHeaders: settings.traceHeaders, maxBodyLength: settings.maxBodyLength },
      { memo },
    );
  }, [selected, settings, fieldIds, mask, memo]);

  if (!settings) return <div className="empty">설정 불러오는 중…</div>;

  return (
    <div className="app">
      {!extensionAlive && (
        <div className="banner" role="alert">
          확장 프로그램이 갱신되어 이 패널의 연결이 끊어졌습니다. 설정 저장과 새 요청 캡처가 동작하지 않으니 DevTools를 닫고 다시 열어주세요.
        </div>
      )}
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
          <label className="toggle" title="XHR/fetch 요청과 에러가 난 페이지(document) 요청만 표시">
            <input type="checkbox" checked={effXhrOnly} onChange={(e) => setXhrOnly(e.target.checked)} />
            API만
          </label>
          <button className="icon" title="목록 지우기" onClick={clearAll} aria-label="목록 지우기">
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
              <ReportPreview
                report={report}
                mask={mask}
                onMaskChange={setMask}
                requestKey={selected.id}
                memo={memo}
                onMemoChange={setMemo}
              />
            ) : (
              <div className="empty">왼쪽 목록에서 요청을 선택하세요.</div>
            )}
            {showFields && (
              <FieldPicker
                selected={fieldIds}
                onChange={(ids) => {
                  setDemoFieldIds(null);
                  update({ selectedFieldIds: ids });
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

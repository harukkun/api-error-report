import { useState } from "react";
import type { Settings } from "../../lib/defaults";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
}

export function SettingsPanel({ settings, onChange, onReset }: Props) {
  const [traceText, setTraceText] = useState(settings.traceHeaders.join("\n"));

  const commitTrace = () => {
    const list = traceText
      .split(/[\n,]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    onChange({ traceHeaders: Array.from(new Set(list)) });
  };

  return (
    <div className="settings">
      <div className="settings-head">
        <span className="section-title">설정</span>
        <button
          className="link"
          onClick={() => {
            if (confirm("모든 설정과 표기 필드 선택을 기본값으로 되돌릴까요?")) onReset();
          }}
        >
          전체 초기화
        </button>
      </div>

      <fieldset className="field-group">
        <legend>리스트 기본 필터</legend>
        <label className="field-item">
          <input type="checkbox" checked={settings.errorsOnlyDefault} onChange={(e) => onChange({ errorsOnlyDefault: e.target.checked })} />
          <span>에러(4xx/5xx/실패)만 표시</span>
        </label>
        <label className="field-item">
          <input type="checkbox" checked={settings.xhrOnlyDefault} onChange={(e) => onChange({ xhrOnlyDefault: e.target.checked })} />
          <span>XHR/fetch만 표시</span>
        </label>
        <label className="field-item">
          <input type="checkbox" checked={settings.hidePreflight} onChange={(e) => onChange({ hidePreflight: e.target.checked })} />
          <span>OPTIONS(preflight) 숨김</span>
        </label>
        <label className="field-item">
          <input type="checkbox" checked={settings.preserveLog} onChange={(e) => onChange({ preserveLog: e.target.checked })} />
          <span>페이지 이동 시 로그 유지</span>
        </label>
      </fieldset>

      <fieldset className="field-group">
        <legend>보안</legend>
        <label className="field-item">
          <input type="checkbox" checked={settings.maskByDefault} onChange={(e) => onChange({ maskByDefault: e.target.checked })} />
          <span>authorization/cookie 기본 마스킹</span>
        </label>
      </fieldset>

      <fieldset className="field-group">
        <legend>응답 바디 최대 길이 (문자)</legend>
        <input
          type="number"
          min={500}
          step={500}
          value={settings.maxBodyLength}
          onChange={(e) => onChange({ maxBodyLength: Math.max(500, Number(e.target.value) || 500) })}
        />
      </fieldset>

      <fieldset className="field-group">
        <legend>Trace 헤더 목록 (줄바꿈 또는 쉼표 구분)</legend>
        <textarea rows={6} value={traceText} onChange={(e) => setTraceText(e.target.value)} onBlur={commitTrace} spellCheck={false} />
        <p className="hint">"Trace 헤더" 필드를 체크하면 이 목록 중 응답에 존재하는 헤더가 리포트에 포함됩니다.</p>
      </fieldset>
    </div>
  );
}

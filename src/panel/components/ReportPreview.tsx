import { useEffect, useState } from "react";

interface Props {
  report: string;
  mask: boolean;
  onMaskChange: (mask: boolean) => void;
  requestKey: string;
  memo: string;
  onMemoChange: (memo: string) => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

export function ReportPreview({ report, mask, onMaskChange, requestKey, memo, onMemoChange }: Props) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    setCopied("idle");
  }, [requestKey, report]);

  const onCopy = async () => {
    const ok = await copyText(report);
    setCopied(ok ? "ok" : "fail");
    setTimeout(() => setCopied("idle"), 1500);
  };

  return (
    <div className="report">
      <div className="report-toolbar">
        <span className="section-title">리포트 미리보기</span>
        <label className={`toggle ${mask ? "" : "danger"}`} title="해제하면 토큰/쿠키가 원문으로 포함됩니다">
          <input type="checkbox" checked={!mask} onChange={(e) => onMaskChange(!e.target.checked)} />
          토큰 전체 포함
        </label>
        <button className="primary" onClick={onCopy}>
          {copied === "ok" ? "복사됨 ✓" : copied === "fail" ? "복사 실패" : "복사"}
        </button>
      </div>
      <textarea
        className="memo"
        rows={2}
        placeholder="메모 / 재현 단계 (선택) — 예: 마이페이지에서 회원탈퇴 버튼 클릭 시 발생"
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        aria-label="메모"
      />
      <textarea className="report-body" readOnly value={report} spellCheck={false} />
    </div>
  );
}

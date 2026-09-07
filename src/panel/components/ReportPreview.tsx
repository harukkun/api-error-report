import { useEffect, useState } from "react";

interface Props {
  markdown: string;
  mask: boolean;
  onMaskChange: (mask: boolean) => void;
  requestKey: string;
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

export function ReportPreview({ markdown, mask, onMaskChange, requestKey }: Props) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    setCopied("idle");
  }, [requestKey, markdown]);

  const onCopy = async () => {
    const ok = await copyText(markdown);
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
      <textarea className="report-body" readOnly value={markdown} spellCheck={false} />
    </div>
  );
}

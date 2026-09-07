import { useState } from "react";
import type { CapturedRequest } from "../../lib/har";
import { formatBody, formatHeaders } from "../../lib/format";
import { buildCurl } from "../../lib/curl";

interface Props {
  req: CapturedRequest;
  mask: boolean;
}

type Tab = "headers" | "payload" | "response" | "curl";

export function RequestDetail({ req, mask }: Props) {
  const [tab, setTab] = useState<Tab>("headers");
  const tabs: { id: Tab; label: string }[] = [
    { id: "headers", label: "Headers" },
    { id: "payload", label: "Payload" },
    { id: "response", label: "Response" },
    { id: "curl", label: "cURL" },
  ];

  let content = "";
  if (tab === "headers") {
    content =
      `# General\n${req.method.toUpperCase()} ${req.fullUrl}\nStatus: ${req.status} ${req.statusText}${req.errorReason ? ` (${req.errorReason})` : ""}\n` +
      `Started: ${req.startedAt}\nDuration: ${req.durationMs}ms\n\n# Request Headers\n${formatHeaders(req.requestHeaders) ?? "(none)"}\n\n# Response Headers\n${formatHeaders(req.responseHeaders) ?? "(none)"}`;
  } else if (tab === "payload") {
    content = formatBody(req.requestBody, 0) ?? "(no payload)";
  } else if (tab === "response") {
    content = req.responseBody ? formatBody(req.responseBody, 0) ?? "(empty)" : "(loading or unavailable)";
  } else {
    content = buildCurl(req, { mask });
  }

  return (
    <div className="detail">
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <pre className="detail-body">{content}</pre>
    </div>
  );
}

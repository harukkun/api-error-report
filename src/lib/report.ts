import type { CapturedRequest } from "./har";
import { FIELD_MAP, GROUP_LABELS, GROUP_ORDER, type FieldGroup, type RenderContext, type ReportField } from "./fields";

export const REPORT_TITLE = "🚨 API 에러 정보";

function renderField(field: ReportField, value: string): string {
  if (field.kind === "inline") {
    return `${field.label}: ${value}`;
  }
  return `${field.label}:\n${value}`;
}

/** 선택된 필드를 플레인 텍스트 리포트로 조합 */
export function buildReport(req: CapturedRequest, selectedIds: string[], ctx: RenderContext): string {
  const selected = new Set(selectedIds);
  const sections: string[] = [REPORT_TITLE];

  for (const group of GROUP_ORDER) {
    const fields = Object.values(FIELD_MAP).filter((f) => f.group === group && selected.has(f.id));
    const rendered: string[] = [];
    for (const f of fields) {
      const value = f.extract(req, ctx);
      if (value === undefined || value === "") continue;
      rendered.push(renderField(f, value));
    }
    if (rendered.length === 0) continue;
    sections.push(groupSection(group, rendered));
  }

  return sections.join("\n\n");
}

function groupSection(group: FieldGroup, rendered: string[]): string {
  const body = joinRendered(rendered);
  // general은 소제목 없이 상단에
  if (group === "general") return body;
  return `[${GROUP_LABELS[group]}]\n${body}`;
}

function joinRendered(rendered: string[]): string {
  // 연속된 한 줄 항목은 줄바꿈 하나, 여러 줄 항목(블록)은 빈 줄로 구분
  let out = "";
  for (let i = 0; i < rendered.length; i++) {
    const cur = rendered[i];
    if (i === 0) {
      out = cur;
      continue;
    }
    const prevBlock = rendered[i - 1].includes("\n");
    const curBlock = cur.includes("\n");
    out += prevBlock || curBlock ? `\n\n${cur}` : `\n${cur}`;
  }
  return out;
}

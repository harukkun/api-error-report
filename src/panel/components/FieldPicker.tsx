import { FIELDS, GROUP_LABELS, GROUP_ORDER, DEFAULT_FIELD_IDS } from "../../lib/fields";

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function FieldPicker({ selected, onChange }: Props) {
  const set = new Set(selected);
  const toggle = (id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(FIELDS.filter((f) => next.has(f.id)).map((f) => f.id));
  };
  const isDefault = selected.length === DEFAULT_FIELD_IDS.length && selected.every((id, i) => id === DEFAULT_FIELD_IDS[i]);

  return (
    <div className="field-picker">
      <div className="field-picker-head">
        <span className="section-title">표기 필드</span>
        <button className="link" disabled={isDefault} onClick={() => onChange(DEFAULT_FIELD_IDS)}>
          기본값 복원
        </button>
      </div>
      {GROUP_ORDER.map((g) => (
        <fieldset key={g} className="field-group">
          <legend>{GROUP_LABELS[g]}</legend>
          {FIELDS.filter((f) => f.group === g).map((f) => (
            <label key={f.id} className="field-item" title={f.description}>
              <input type="checkbox" checked={set.has(f.id)} onChange={() => toggle(f.id)} />
              <span>{f.label}</span>
              {f.defaultOn && <span className="badge">기본</span>}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

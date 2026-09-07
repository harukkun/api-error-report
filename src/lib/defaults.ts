export const DEFAULT_TRACE_HEADERS = [
  "x-request-id",
  "x-correlation-id",
  "x-trace-id",
  "x-b3-traceid",
  "traceparent",
];

export interface Settings {
  selectedFieldIds: string[];
  traceHeaders: string[];
  maskByDefault: boolean;
  errorsOnlyDefault: boolean;
  xhrOnlyDefault: boolean;
  hidePreflight: boolean;
  maxBodyLength: number;
  preserveLog: boolean;
}

export const SETTINGS_KEY = "settings";

/** selectedFieldIds는 fields.ts에서 defaultOn 기준으로 채움 */
export const DEFAULT_SETTINGS: Omit<Settings, "selectedFieldIds"> = {
  traceHeaders: DEFAULT_TRACE_HEADERS,
  maskByDefault: true,
  errorsOnlyDefault: true,
  xhrOnlyDefault: true,
  hidePreflight: true,
  maxBodyLength: 10_000,
  preserveLog: false,
};

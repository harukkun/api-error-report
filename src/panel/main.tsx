import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// DevTools 테마 동기화. 확장 밖(vite preview)에서는 OS 설정을 따름
function resolveTheme(): "dark" | "light" {
  const devtoolsTheme = typeof chrome !== "undefined" ? chrome.devtools?.panels?.themeName : undefined;
  if (devtoolsTheme) return devtoolsTheme === "dark" ? "dark" : "light";
  // 확장 밖(미리보기/스크린샷)에서는 ?theme= 로 강제 가능
  const forced = new URLSearchParams(window.location.search).get("theme");
  if (forced === "dark" || forced === "light") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
document.documentElement.dataset.theme = resolveTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

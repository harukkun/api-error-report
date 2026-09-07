import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// DevTools 테마 동기화. 확장 밖(vite preview)에서는 OS 설정을 따름
function resolveTheme(): "dark" | "light" {
  const devtoolsTheme = typeof chrome !== "undefined" ? chrome.devtools?.panels?.themeName : undefined;
  if (devtoolsTheme) return devtoolsTheme === "dark" ? "dark" : "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
document.documentElement.dataset.theme = resolveTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

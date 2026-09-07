import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" with { type: "json" };

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    // 확장 페이지에서는 modulepreload 링크/폴리필이 "cross-world resource mismatch" 경고를 내므로 끔
    modulePreload: false,
    rollupOptions: {
      input: {
        panel: "src/panel/panel.html",
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

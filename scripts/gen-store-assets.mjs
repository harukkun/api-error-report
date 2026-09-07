// 스토어 이미지 생성
//  - store/promo-tile-440x280.png : 아이콘 SVG + 텍스트 (resvg)
//  - store/screenshot-{1,2}-1280x800.png : vite preview + Chrome headless (라이트/다크, 데모 모드)
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "store");
mkdirSync(outDir, { recursive: true });

// ── 1. 프로모션 타일 ─────────────────────────────────────────
function iconSymbol() {
  // icon.svg 에서 배경 사각형과 16px 오버라이드 속성을 제거한 심볼만 추출
  const svg = readFileSync(resolve(root, "icons/icon.svg"), "utf8");
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return inner
    .replace(/<rect width="128" height="128"[^>]*\/>/, "")
    .replace(/\sdata-s16="[^"]*"/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
  <rect width="440" height="280" fill="#1E2A3A"/>
  <rect x="36" y="60" width="160" height="160" rx="36" fill="#26354A"/>
  <g transform="translate(52 76) scale(1)">${iconSymbol()}</g>
  <text x="222" y="126" fill="#FFFFFF" font-family="Helvetica Neue, Apple SD Gothic Neo, Arial, sans-serif" font-size="27" font-weight="700">Network</text>
  <text x="222" y="160" fill="#FFFFFF" font-family="Helvetica Neue, Apple SD Gothic Neo, Arial, sans-serif" font-size="27" font-weight="700">Error Report</text>
  <text x="222" y="194" fill="#B8C4D6" font-family="Apple SD Gothic Neo, Helvetica Neue, Arial, sans-serif" font-size="14">DevTools에서 에러 리포트를</text>
  <text x="222" y="214" fill="#B8C4D6" font-family="Apple SD Gothic Neo, Helvetica Neue, Arial, sans-serif" font-size="14">한 번에 복사</text>
</svg>`;
const tilePng = new Resvg(tile, { font: { loadSystemFonts: true, defaultFontFamily: "Apple SD Gothic Neo" } }).render().asPng();
writeFileSync(resolve(outDir, "promo-tile-440x280.png"), tilePng);
console.log("✔ store/promo-tile-440x280.png");

// ── 2. 스크린샷 ─────────────────────────────────────────────
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chrome)) {
  console.log(`ℹ Chrome을 찾지 못해 스크린샷은 건너뜁니다 (${chrome}). CHROME_PATH 환경변수로 지정할 수 있습니다.`);
  process.exit(0);
}
if (!existsSync(resolve(root, "dist/src/panel/panel.html"))) {
  console.error("✖ dist 가 없습니다. `npm run build` 먼저.");
  process.exit(1);
}

const port = 4179;
const preview = spawn("npx", ["vite", "preview", "--port", String(port), "--strictPort"], {
  cwd: root,
  stdio: "ignore",
  detached: true,
});
const base = `http://localhost:${port}/src/panel/panel.html`;

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("vite preview 가 시작되지 않았습니다");
}

try {
  await waitForServer(base);
  const shots = [
    { file: "screenshot-1-1280x800.png", theme: "light" },
    { file: "screenshot-2-1280x800.png", theme: "dark" },
  ];
  for (const { file, theme } of shots) {
    const out = resolve(outDir, file);
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--window-size=1280,800",
        `--screenshot=${out}`,
        "--virtual-time-budget=3000",
        `${base}?demo=1&theme=${theme}`,
      ],
      { stdio: "ignore", timeout: 60_000 },
    );
    console.log(`✔ store/${file}`);
  }
} finally {
  try {
    process.kill(-preview.pid);
  } catch {
    preview.kill();
  }
}

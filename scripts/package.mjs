// dist/ → release/network-error-report-<version>.zip
// 업로드 전 검사: package.json/manifest.json 버전 일치, description 길이(스토어 132자 제한), dist 존재
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

if (pkg.version !== manifest.version) {
  fail(`버전 불일치: package.json=${pkg.version}, manifest.json=${manifest.version}. 두 파일의 version을 같게 맞춰주세요.`);
}
if (!manifest.description || manifest.description.length > 132) {
  fail(`manifest.description 길이 ${manifest.description?.length ?? 0}자. 스토어 제한은 132자입니다.`);
}
const dist = resolve(root, "dist");
if (!existsSync(resolve(dist, "manifest.json"))) {
  fail("dist/manifest.json 이 없습니다. 먼저 `npm run build` 를 실행하세요.");
}

const releaseDir = resolve(root, "release");
mkdirSync(releaseDir, { recursive: true });
const out = resolve(releaseDir, `network-error-report-${manifest.version}.zip`);
execFileSync("zip", ["-r", "-q", "-X", out, ".", "-x", ".DS_Store"], { cwd: dist, stdio: "inherit" });

const kb = (statSync(out).size / 1024).toFixed(1);
console.log(`\n✔ ${out} (${kb} KB)`);
console.log("  Chrome 웹 스토어 대시보드 → 패키지 → 새 패키지 업로드 에서 이 zip을 올리세요.\n");

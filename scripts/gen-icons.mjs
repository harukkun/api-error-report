// icons/icon.svg → icons/icon{16,48,128}.png
// 16px는 세부가 뭉개지므로 data-s16="attr=value;attr=value" 로 표시된 속성을 덮어써 렌더한다.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "icons/icon.svg"), "utf8");

function applySizeOverrides(svg) {
  return svg.replace(/<([a-zA-Z]+)([^>]*?)\sdata-s16="([^"]*)"([^>]*)>/g, (_m, tag, before, spec, after) => {
    let attrs = `${before}${after}`;
    for (const pair of spec.split(";")) {
      const [k, v] = pair.split("=").map((s) => s.trim());
      if (!k) continue;
      const re = new RegExp(`\\s${k}="[^"]*"`);
      attrs = re.test(attrs) ? attrs.replace(re, ` ${k}="${v}"`) : `${attrs} ${k}="${v}"`;
    }
    return `<${tag}${attrs}>`;
  });
}

const stripOverrides = (svg) => svg.replace(/\sdata-s16="[^"]*"/g, "");

for (const size of [16, 48, 128]) {
  const svg = size <= 16 ? applySizeOverrides(src) : stripOverrides(src);
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
  const out = resolve(root, `icons/icon${size}.png`);
  writeFileSync(out, png);
  console.log(`wrote ${out} (${png.length} bytes)`);
}

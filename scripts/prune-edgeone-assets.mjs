import { existsSync, rmSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const distDir = join(process.cwd(), "dist");
const largeAssetBase = (process.env.EDGEONE_LARGE_ASSET_BASE || "").replace(/\/+$/, "");

const largeAssets = [
  "/assets/projects/beast-incarnation-demo.mp4",
  "/assets/projects/headhunter-company-demo.mp4",
  "/assets/projects/endless-rush-hour-demo.mp4",
  "/assets/projects/ue5-jett-demo.mp4",
  "/assets/projects/job-hop-life-demo.mp4",
  "/assets/projects/balatro-shader-demo.mp4",
  "/assets/projects/wood-cat-demo.mp4",
  "/assets/projects/anchor-cat-demo.mp4",
  "/games/balatro/Build/WebGL.wasm",
];

const generatedAssetReferences = [
  {
    search: 'codeUrl: buildUrl + "/WebGL.wasm"',
    replacement: `codeUrl: "${largeAssetBase}/games/balatro/Build/WebGL.wasm"`,
  },
];

const textExtensions = new Set([".html", ".js", ".css", ".json", ".svg", ".txt"]);

function walkFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
}

function getExtension(path) {
  const index = path.lastIndexOf(".");
  return index >= 0 ? path.slice(index).toLowerCase() : "";
}

function replaceAll(content, search, replacement) {
  return content.split(search).join(replacement);
}

if (!existsSync(distDir)) {
  throw new Error("dist directory not found. Run vite build before pruning EdgeOne assets.");
}

if (!largeAssetBase) {
  console.warn("[edgeone] EDGEONE_LARGE_ASSET_BASE is not set; oversized files will be removed without URL rewriting.");
}

const files = walkFiles(distDir);

if (largeAssetBase) {
  for (const file of files) {
    if (!textExtensions.has(getExtension(file))) continue;

    let content = readFileSync(file, "utf8");
    const original = content;

    for (const asset of largeAssets) {
      const remoteUrl = `${largeAssetBase}${asset}`;
      content = replaceAll(content, asset, remoteUrl);
    }

    for (const reference of generatedAssetReferences) {
      content = replaceAll(content, reference.search, reference.replacement);
    }

    if (content !== original) {
      writeFileSync(file, content);
      console.log(`[edgeone] rewrote large asset urls in ${relative(distDir, file)}`);
    }
  }
}

for (const asset of largeAssets) {
  const localPath = join(distDir, asset.slice(1));
  if (!existsSync(localPath)) continue;

  rmSync(localPath, { force: true });
  console.log(`[edgeone] removed oversized asset ${asset}`);
}

const remainingOversized = walkFiles(distDir)
  .map((file) => ({ file, size: statSync(file).size }))
  .filter(({ size }) => size > 25 * 1024 * 1024);

if (remainingOversized.length) {
  const list = remainingOversized
    .map(({ file, size }) => `- ${relative(distDir, file)} (${(size / 1024 / 1024).toFixed(2)} MiB)`)
    .join("\n");
  throw new Error(`EdgeOne single-file limit exceeded after pruning:\n${list}`);
}

console.log("[edgeone] build output is within the 25 MiB single-file limit.");

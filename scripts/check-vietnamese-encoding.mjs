import fs from "node:fs";
import path from "node:path";

const roots = [
  "apps/admin/src",
  "apps/web/src",
  "apps/api/src",
  "apps/api/prisma/seed.ts",
];

const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".json"]);
const mojibakePattern = /\u00c3|\u00c2|\u00c4\u2018|\u00c4\u0090|\u00c6\u00b0|\u00e1\u00ba|\u00e1\u00bb|\u00e2\u20ac|\ufffd/;
const allowedFiles = new Set([
  // Runtime repair helpers intentionally contain escaped mojibake detection patterns.
]);

function collectFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") return [];
    return collectFiles(path.join(target, entry.name));
  });
}

const offenders = [];

for (const root of roots) {
  for (const file of collectFiles(root)) {
    if (allowedFiles.has(file)) continue;
    if (!extensions.has(path.extname(file))) continue;
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (mojibakePattern.test(line)) {
        offenders.push(`${file}:${index + 1}: ${line.trim().slice(0, 180)}`);
      }
    });
  }
}

if (offenders.length) {
  console.error("Vietnamese mojibake detected. Fix these lines before build/deploy:");
  console.error(offenders.slice(0, 80).join("\n"));
  if (offenders.length > 80) console.error(`...and ${offenders.length - 80} more`);
  process.exit(1);
}

console.log("Vietnamese encoding check passed.");

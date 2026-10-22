import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { deadInternalHrefPaths } from "./dead-internal-hrefs";
import { getLegacyRedirectTarget, isLegacyRedirectSource } from "./legacy-redirects";
import { getGscNotFoundTarget, gscNotFoundRedirects } from "./legacy-redirects-gsc";
import { getMalformedLegacyTarget, proxy } from "../proxy";

const entries = Object.entries(gscNotFoundRedirects);
assert.equal(entries.length, 187);

for (const [source, target] of entries) {
  assert.ok(source.startsWith("/") && target.startsWith("/"), `${source} -> ${target} must be root-relative`);
  assert.notEqual(source, target);
  assert.ok(!source.includes("?"), `${source} must not carry a query string`);
  // No chains: a destination must never itself be redirected.
  assert.equal(getGscNotFoundTarget(target), undefined, `${target} is also a GSC source`);
  assert.equal(getLegacyRedirectTarget(target), undefined, `${target} is also a legacy source`);
  assert.equal(getMalformedLegacyTarget(target), undefined, `${target} is also a malformed source`);
  // Explicit legacy entries win in proxy.ts; keep the two maps disjoint so the GSC entry is never dead code.
  assert.equal(isLegacyRedirectSource(source), false, `${source} already exists in legacySeoRedirects`);
  // Paths previously judged to have no equivalent destination stay unredirected.
  assert.equal(deadInternalHrefPaths.has(source), false, `${source} is a known dead path`);
}

function redirectOf(rawPath: string) {
  const response = proxy(new NextRequest(`https://hathanhhome.vn${rawPath}`));
  return { status: response.status, location: response.headers.get("location") };
}

const samples: Array<[string, string]> = [
  // The post it pointed to was merged on 2026-10-22; the old URL goes straight to the kept post.
  ["/xin-cap-phep-xay-dung-o-dau-4", "https://hathanhhome.vn/tin-tuc/xin-giay-phep-xay-dung-can-nhung-gi"],
  ["/du-an/xay-nha-tron-goi-tai-phu-xuyen-hathanhhome", "https://hathanhhome.vn/du-an/xay-nha-tron-goi-tai-phu-xuyen"],
  ["/bao-gia-xay-nha-tron-goi-tai-ha-noi", "https://hathanhhome.vn/du-an/bao-gia-xay-nha-tron-goi-tai-ha-noi-2026"],
  ["/55+-mau-biet-thu-san-vuon-mai-nhat-duoc-ua-chuong-2026", "https://hathanhhome.vn/mau-thiet-ke-kien-truc/55-mau-biet-thu-san-vuon-mai-nhat-duoc-ua-chuong-2026"],
  ["/%22../co-nen-cung-dong-tho-xay-nha/%22", "https://hathanhhome.vn/tin-tuc/co-nen-cung-dong-tho-xay-nha"],
  ["/xay-nha-tron-goi-tai-xuam-truong-nam-dinh", "https://hathanhhome.vn/du-an/xay-nha-tron-goi-tai-nam-dinh"],
  ["/xay-nha-tron-goi-tai-hai-d%C6%B0%C6%A1ng", "https://hathanhhome.vn/du-an/xay-nha-tron-goi-tai-hai-duong-cap-nhat-bao-gia-moi-nhat2026"],
];
for (const [rawPath, location] of samples) assert.deepEqual(redirectOf(rawPath), { status: 308, location });

// Query strings keep the existing proxy behaviour (preserved on the destination).
assert.deepEqual(redirectOf("/xay-nha-tron-goi-2?p=1&filter="), {
  status: 308,
  location: "https://hathanhhome.vn/dich-vu/xay-nha-tron-goi?p=1&filter=",
});

// Near-miss and dead paths are untouched.
for (const untouched of ["/xin-cap-phep-xay-dung-o-dau-5", "/xay-nha-tron-goi-tai-ha-long"]) {
  assert.deepEqual(redirectOf(untouched), { status: 200, location: null });
}

console.log(`legacy-redirects-gsc: ${entries.length} redirects verified`);

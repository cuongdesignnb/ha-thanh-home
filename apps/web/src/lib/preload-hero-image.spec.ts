import assert from "node:assert/strict";
import { isMobileRequest, mediumHeroVariant } from "./preload-hero-image";

// Only pipeline renditions have a guaranteed 768px sibling.
assert.equal(
  mediumHeroVariant("https://hathanhhome.vn/uploads/2026/05/6898827026/cong-trinh-dang-thi-cong-large.webp"),
  "https://hathanhhome.vn/uploads/2026/05/6898827026/cong-trinh-dang-thi-cong-medium.webp",
);
assert.equal(mediumHeroVariant("https://hathanhhome.vn/uploads/202604/g912l8s6_medium.webp"), undefined);
assert.equal(mediumHeroVariant("https://images.unsplash.com/photo-1541888946425?auto=format&w=1200"), undefined);
assert.equal(mediumHeroVariant("https://hathanhhome.vn/uploads/2026/05/x/large-house.webp"), undefined);

const headersOf = (values: Record<string, string>) => ({ get: (name: string) => values[name.toLowerCase()] ?? null });
assert.equal(isMobileRequest(headersOf({ "sec-ch-ua-mobile": "?1" })), true);
assert.equal(isMobileRequest(headersOf({ "sec-ch-ua-mobile": "?0", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126" })), false);
assert.equal(isMobileRequest(headersOf({ "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148" })), true);
assert.equal(isMobileRequest(headersOf({ "user-agent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/126 Mobile Safari/537.36" })), true);
assert.equal(isMobileRequest(headersOf({ "user-agent": "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" })), true);
assert.equal(isMobileRequest(headersOf({})), false);

console.log("preload-hero-image: variant and device detection verified");

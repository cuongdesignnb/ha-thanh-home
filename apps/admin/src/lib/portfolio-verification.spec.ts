import assert from "node:assert/strict";
import {
  newProjectPortfolioVerificationDefault,
  normalizePortfolioVerification,
  portfolioVerificationHelpText,
} from "./portfolio-verification";

assert.equal(newProjectPortfolioVerificationDefault(), false);
assert.equal(normalizePortfolioVerification(true), true);
assert.equal(normalizePortfolioVerification(false), false);
assert.equal(normalizePortfolioVerification(undefined), false);
assert.equal(normalizePortfolioVerification("true"), false);
assert.equal(
  portfolioVerificationHelpText,
  "Chỉ bật khi đã xác nhận đây là công trình Hà Thành Home thực hiện và nội dung/hình ảnh đủ cơ sở để sử dụng như hồ sơ năng lực.",
);

console.log("Admin portfolio verification tests passed.");

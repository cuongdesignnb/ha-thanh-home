export const portfolioVerificationHelpText =
  "Chỉ bật khi đã xác nhận đây là công trình Hà Thành Home thực hiện và nội dung/hình ảnh đủ cơ sở để sử dụng như hồ sơ năng lực.";

export function normalizePortfolioVerification(value: unknown) {
  return value === true;
}

export function newProjectPortfolioVerificationDefault() {
  return false;
}

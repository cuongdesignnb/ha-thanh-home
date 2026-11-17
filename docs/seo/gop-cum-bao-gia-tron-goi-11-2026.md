# Đề xuất gộp cụm "báo giá / xây nhà trọn gói" (16/11/2026)

Trạng thái: **chờ anh/chị duyệt**. Chưa sửa gì trên website.

## Vì sao cần gộp

- Website có 31 trang cùng nói về giá xây nhà trọn gói, cách tính, trọn gói gồm những gì, hợp đồng và vật tư. Danh sách lấy từ sitemap, không tính trang khu vực, biệt thự, nội thất và nhà xưởng.
- Với nhóm từ khoá "giá xây nhà trọn gói" trong 16 tháng, Google chia lượt hiển thị cho **19 trang khác nhau**. Trang nào cũng chỉ được 2–7 lượt hiển thị, ở vị trí 30–60. Không trang nào đủ mạnh để lên trang 1.
- Báo cáo Trang ngày 16/11: số trang có trên Google giảm từ 332 xuống 287, số trang "đã quét nhưng không đưa lên" tăng lên 289. Google đang tự bỏ bớt các trang trùng ý.

## Cách làm (giống đợt gộp tháng 10)

1. Trang bị gộp chuyển hướng 308 về trang giữ lại. Link trong bài viết tự đổi theo, sitemap tự bỏ trang cũ. Thêm vào `apps/web/src/lib/content-consolidation-redirects.ts` trong một PR để anh/chị merge.
2. Trang giữ lại được bổ sung nội dung tốt nhất của các trang bị gộp. Giá thống nhất theo trang dịch vụ (thô + nhân công hoàn thiện 4–5; tiêu chuẩn 6–7,5; khá 7–8,5; cao cấp 8–10 triệu/m², áp dụng 01/06/2026 – 01/01/2027).
3. Sau khi deploy: lưu trữ (archive) các trang bị gộp trong Admin, gửi lại sitemap và yêu cầu lập chỉ mục cho các trang giữ lại.

Số liệu trong bảng: lượt bấm / lượt hiển thị / vị trí trung bình trong 16 tháng theo Search Console, **đã cộng cả các link cũ** từng chuyển hướng về trang đó.

## Bảng đề xuất

### Nhóm 1 – Báo giá xây nhà trọn gói (Hà Nội, 2026) → giữ trang dịch vụ

| # | Trang | Bấm / hiển thị / vị trí | Đề xuất |
|---|---|---|---|
| 1 | `/dich-vu/xay-nha-tron-goi` | 13 / 355 / 5,3 | **GIỮ** (trang chính, có bảng giá chuẩn) |
| 2 | `/du-an/bao-gia-xay-nha-tron-goi-tai-ha-noi-2026` | 1 / 259 / 4,9 | Gộp → trang dịch vụ |
| 5 | `/bao-gia-xay-nha-tron-goi-nam-2026-cach-tinh-chi-phi-chuan-cho-gia-chu` | 1 / 58 / 5,4 | Gộp → trang dịch vụ |
| 6 | `/du-an/bao-gia-xay-nha-tron-goi-nam-2026-cach-tinh-chi-phi-chon-nha-thau-uy-tin` | 0 / 0 | Gộp → trang dịch vụ |
| 7 | `/du-an/bao-gia-xay-nha-tron-goi-hathanhhome-uy-tin-chat-luong` | 2 / 13 / 3,4 | Gộp → trang dịch vụ |

### Nhóm 2 – Đơn giá, cách tính theo m², bao nhiêu tiền 1 m² → giữ bài đơn giá

| # | Trang | Bấm / hiển thị / vị trí | Đề xuất |
|---|---|---|---|
| 8 | `/tin-tuc/don-gia-xay-dung-nha-tron-goi-moi-nhat` | 7 / 262 / 3,1 | **GIỮ** (tốt nhất cụm). Cập nhật giá cho khớp trang dịch vụ |
| 3 | `/tin-tuc/bao-gia-xay-nha-tron-goi-tai-ha-noi-2026-cach-tinh-chi-tiet-theo-m2` | 0 / 104 / 4,8 | Gộp → bài đơn giá. Giá đang lệch (cao cấp 9,5–13) |
| 4 | `/du-an/xay-nha-tron-goi-bao-nhieu-tien-1m2` | 0 / 49 / 25,5 | Gộp → bài đơn giá |
| 13 | `/du-an/cach-tinh-don-gia-xay-dung-theo-m2-chinh-xac-nhat` | 0 / 46 / 9,8 | Gộp → bài đơn giá |

### Nhóm 3 – Trọn gói gồm những gì → giữ bài "từ móng đến nội thất"

| # | Trang | Bấm / hiển thị / vị trí | Đề xuất |
|---|---|---|---|
| 11 | `/tin-tuc/xay-nha-tron-goi-tu-mong-den-noi-that` | 0 / 49 / 7,4 | **GIỮ** (dài nhất, đã giữ lại từ đợt tháng 10) |
| 10 | `/du-an/xay-nha-tron-goi-ha-noi-gom-nhung-gi` | 0 / 137 / 8,7 | Gộp → bài 11 |
| 9 | `/tin-tuc/bao-gia-xay-nha-tron-goi-bao-gom-nhung-gi` | 0 / 0 | Gộp → bài 11 |

### Nhóm 4 – Có nên xây trọn gói / trọn gói là gì → giữ bài "nên xây trọn gói hay tự thuê thợ"

| # | Trang | Bấm / hiển thị / vị trí | Đề xuất |
|---|---|---|---|
| 21 | `/tin-tuc/nen-xay-nha-tron-goi-hay-tu-thue-tho` | 1 / 184 / 24,9 | **GIỮ** (đã giữ lại từ đợt tháng 10) |
| 22 | `/tin-tuc/vi-sao-nhieu-gia-chu-chon-xay-nha-tron-goi-thay-vi-tu-thue-tung-doi-tho` | 1 / 47 / 7,1 | Gộp → bài 21 |
| 12 | `/du-an/xay-nha-tron-goi-la-gi-co-nen-chon-dich-vu-chia-khoa-trao-tay-khong` | 0 / 31 / 19,5 | Gộp → bài 21 |

### Nhóm 5 – Từng cặp trùng ý → giữ bài dài hơn

| # | Trang bị gộp | Bấm / hiển thị / vị trí | Gộp về (GIỮ) |
|---|---|---|---|
| 14 | `/du-an/cach-tinh-chi-phi-xay-nha-tron-goi-khong-phat-sinh` | 0 / 77 / 16,6 | `/tin-tuc/cac-khoan-phat-sinh-khi-xay-nha-tron-goi-va-cach-kiem-soat-ngay-tu-hop-dong` |
| 17 | `/du-an/mau-hop-dong-xay-nha-tron-goi-chi-tiet-chuan-phap-ly` | 2 / 45 / 47,3 | `/tin-tuc/hop-dong-xay-nha-tron-goi-khong-phat-sinh-12-dieu-khoan-gia-chu-phai-kiem-tra` (thêm mục "mẫu hợp đồng" vào bài giữ) |
| 19 | `/tin-tuc/so-sanh-chi-phi-xay-nha-tron-goi-va-xay-tho` | 0 / 17 / 7,9 | `/tin-tuc/xay-nha-phan-tho-va-tron-goi-khac-nhau-the-nao-nen-chon-goi-nao` |
| 24 | `/tin-tuc/xay-nha-tron-goi-nha-pho-giai-phap-toi-uu-cong-nang-va-chi-phi-cho-gia-chu` | 0 / 73 / 17,9 | `/tin-tuc/xay-nha-pho-tron-goi` |
| 26 | `/du-an/vat-lieu-thi-cong-xay-nha-tron-goi` | 1 / 49 / 5,1 | `/tin-tuc/bang-vat-tu-xay-nha-tron-goi-cach-kiem-tra-truoc-khi-ky-hop-dong` |

### Giữ nguyên, không gộp

| Trang | Lý do |
|---|---|
| `/tin-tuc/cach-tinh-chi-phi-xay-nha-tranh-phat-sinh` | Đã là trang giữ lại của đợt tháng 10; nói cách tính tổng chi phí, không riêng trọn gói |
| `/tin-tuc/bao-gia-xay-dung-nha-pho` | Ý "báo giá nhà phố" khác "dịch vụ xây nhà phố"; đã là trang giữ lại tháng 10 |
| `/du-an/bao-gia-xay-nha-tron-goi-lien-ke-nam-2026` | Riêng nhà liền kề (88 hiển thị, vị trí 7,1) |
| `/tin-tuc/cach-len-du-toan-chi-phi-xay-nha-tiet-kiem`, `/tin-tuc/du-toan-chi-phi-xay-nha-online`, `/tin-tuc/chi-phi-xay-dung-cam-nang-du-toan-kiem-soat-ngan-sach` | Chủ đề dự toán, khác báo giá |
| `/du-an/xay-nha-tron-goi-phan-tho-uy-tin-chuyen-nghiep` | Trang báo giá phần thô, vừa nâng cấp ngày 10/11 |
| Các trang "xây nhà trọn gói tại [quận, tỉnh]" | Mỗi trang nhắm một khu vực; một số đang mang lượt bấm (Hà Nam, Nam Định, Thái Bình…) |

## Tổng cộng

- **16 trang gộp** về **9 trang giữ lại**. Không xoá dữ liệu nào: trang cũ chỉ được lưu trữ và chuyển hướng, có thể khôi phục.
- 16 trang bị gộp cộng lại chỉ có 8 lượt bấm trong 16 tháng, nên rủi ro mất lượt truy cập rất thấp.
- Theo dõi kết quả sau 3–4 tuần trong báo cáo Trang và Hiệu suất.

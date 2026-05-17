# Deploy lên VPS aaPanel — Ha Thanh Home

Tài liệu này hướng dẫn đưa hệ thống lên 1 VPS chạy aaPanel + Docker Manager, dùng MySQL của aaPanel ở host, và Nginx reverse proxy cho **1 domain** (ví dụ `hathanh.cuongdesign.net`).

## 1. Yêu cầu VPS

- Ubuntu 22.04+ (RAM tối thiểu 2 GB, khuyến nghị 4 GB)
- aaPanel đã cài + module **Docker Manager** + **MySQL 8** + **Nginx**
- Mở port 80, 443 trên firewall aaPanel
- Đã tạo:
  - Database `hathanh`, user `hathanh`, password mạnh (charset `utf8mb4`)
  - Cấp quyền `%` (Everyone) để Docker bridge truy cập được
  - Trong `/etc/mysql/my.cnf` (hoặc aaPanel → MySQL → Config) đặt `bind-address = 0.0.0.0`, restart MySQL

## 2. SSH lần đầu

```bash
# trên máy local
ssh-keygen -t ed25519 -C "deploy-hathanh"
# copy public key lên VPS
ssh-copy-id root@<vps-ip>
```

Trên VPS thêm SSH key của bạn vào GitHub repo (Deploy keys → Add) nếu repo private, hoặc dùng HTTPS + token.

## 3. Clone repo

```bash
cd /www/wwwroot
git clone git@github.com:cuongdesignnb/ha-thanh-home.git
cd ha-thanh-home
```

## 4. Tạo file env

```bash
cp .env.docker.example .env.docker
nano .env.docker
```

Cần đổi (giá trị production):

```env
NODE_ENV=production

WEB_URL=https://hathanh.cuongdesign.net
ADMIN_URL=https://hathanh.cuongdesign.net/admin
API_URL=https://hathanh.cuongdesign.net/api
NEXT_PUBLIC_WEB_URL=https://hathanh.cuongdesign.net
NEXT_PUBLIC_API_URL=/api
ADMIN_BASE_PATH=/admin

DATABASE_URL=mysql://hathanh:YOUR_DB_PASSWORD@host.docker.internal:3306/hathanh

JWT_SECRET=<openssl rand -base64 48>

PUBLIC_UPLOAD_URL=https://hathanh.cuongdesign.net/uploads
CORS_ORIGIN=https://hathanh.cuongdesign.net

DEFAULT_ADMIN_EMAIL=admin@hathanhhome.vn
DEFAULT_ADMIN_PASSWORD=<đặt mật khẩu mạnh>
```

## 5. Build và chạy Docker

```bash
docker compose --env-file .env.docker -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.docker -f docker-compose.prod.yml ps
```

Lần đầu chạy migration + seed:

```bash
docker compose --env-file .env.docker -f docker-compose.prod.yml exec api npx prisma migrate deploy
docker compose --env-file .env.docker -f docker-compose.prod.yml exec api npm run seed -w @hathanh/api
```

Kiểm tra:

```bash
curl http://127.0.0.1:31875/health   # API
curl -I http://127.0.0.1:31873        # Web
curl -I http://127.0.0.1:31874/admin  # Admin
```

## 6. Cấu hình Nginx aaPanel

1. aaPanel → **Website → Add Site** → domain `hathanh.cuongdesign.net`, không tạo DB, không PHP.
2. Vào site → **Config** → mở config Nginx.
3. Mở file [docs/nginx.aapanel.conf](docs/nginx.aapanel.conf), copy nội dung các block `location` + `client_max_body_size` vào trong `server { ... }`.
4. Đảm bảo path trong block `/uploads/` trỏ đúng tới repo: `/www/wwwroot/ha-thanh-home/storage/uploads/`.
5. Lưu → aaPanel reload Nginx.

## 7. SSL

aaPanel → Site → **SSL → Let's Encrypt** → bật **Force HTTPS**.

## 8. Cập nhật code lần sau

```bash
cd /www/wwwroot/ha-thanh-home
bash scripts/deploy.sh                 # chỉ pull + build + up
bash scripts/deploy.sh --migrate       # nếu có migration mới
bash scripts/deploy.sh --seed          # chỉ chạy 1 lần đầu hoặc khi cần reseed
```

## 9. Backup MySQL (gợi ý)

aaPanel → **Database → hathanh → Backup** → bật lịch tự động (daily), giữ 7 bản.
Backup thư mục `storage/uploads/` bằng aaPanel → Cron → tar về `/www/backup/uploads/`.

## 10. Troubleshooting

| Vấn đề | Cách xử lý |
| --- | --- |
| API không kết nối được MySQL | Kiểm tra `bind-address = 0.0.0.0` trong MySQL config; user `hathanh` có quyền `%`; firewall mở port 3306 cho `172.17.0.0/16` (Docker bridge) |
| Admin trắng tinh ở `/admin` | Đảm bảo `ADMIN_BASE_PATH=/admin` đã set TRƯỚC khi build (rebuild lại: `docker compose ... up -d --build admin`) |
| Ảnh upload không hiển thị | Check quyền thư mục: `chown -R 1000:1000 storage/uploads` và block `/uploads/` trong Nginx |
| `502 Bad Gateway` | `docker compose -f docker-compose.prod.yml ps` xem container nào down, check `docker logs hathanh-<svc>` |


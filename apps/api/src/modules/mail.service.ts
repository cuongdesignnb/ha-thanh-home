import { Injectable, Logger } from "@nestjs/common";
import { Lead } from "@prisma/client";
import nodemailer from "nodemailer";
import { PrismaService } from "./prisma.service";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendLeadNotification(lead: Lead) {
    try {
      const settingRecord = await this.prisma.setting.findUnique({
        where: { key: "site.smtp" },
      });

      if (!settingRecord) {
        this.logger.log("SMTP configuration not found. Skipping email notification.");
        return;
      }

      const smtp = (settingRecord.value as Record<string, unknown>) || {};
      const enabled = smtp.smtpEnabled === true || smtp.smtpEnabled === "true";

      if (!enabled) {
        this.logger.log("SMTP email notification is disabled. Skipping.");
        return;
      }

      const host = String(smtp.smtpHost || "").trim();
      const port = Number(smtp.smtpPort || 587);
      const secure = smtp.smtpSecure === true || smtp.smtpSecure === "true";
      const user = String(smtp.smtpUser || "").trim();
      const pass = String(smtp.smtpPass || "").trim();
      const fromName = String(smtp.smtpFromName || "Hà Thành Home").trim();
      const fromEmail = String(smtp.smtpFromEmail || user).trim();
      const toEmail = String(smtp.smtpToEmail || "").trim();

      if (!host || !user || !pass || !toEmail) {
        this.logger.warn("SMTP config is missing required fields (host, user, pass, toEmail). Skipping.");
        return;
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      const dateStr = new Date(lead.createdAt).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      });

      const sourceTypeMap: Record<string, string> = {
        website: "Form liên hệ công cộng",
        construction_estimator: "Bảng tính dự toán chi phí",
      };
      const sourceLabel = sourceTypeMap[lead.sourceType || ""] || lead.sourceType || "Website";

      const htmlBody = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #0f3d2e; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">HÀ THÀNH HOME</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.85;">Thông báo khách hàng đăng ký tư vấn mới</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <h3 style="margin-top: 0; color: #0f3d2e; border-bottom: 2px solid #c99a4a; padding-bottom: 8px;">Thông tin khách hàng</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tbody>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; width: 140px; font-weight: bold; color: #555;">Họ và tên:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #111;">${lead.fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Số điện thoại:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #cc0000; font-weight: bold; font-size: 15px;"><a href="tel:${lead.phone.replace(/\s/g, "")}" style="color: #cc0000; text-decoration: none;">${lead.phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${lead.email ? `<a href="mailto:${lead.email}" style="color: #0066cc; text-decoration: none;">${lead.email}</a>` : "<i>Không cung cấp</i>"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Nguồn đăng ký:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;"><span style="background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${sourceLabel}</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Nhu cầu:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${lead.demandType || "<i>Chưa chọn</i>"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Kiểu công trình:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${lead.projectType || "<i>Chưa chọn</i>"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Diện tích:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${lead.area ? `${lead.area}` : "<i>Chưa chọn</i>"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Chi phí dự kiến:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #183b2d; font-weight: bold;">${lead.budget || "<i>Chưa chọn</i>"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Khu vực:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${lead.location || "<i>Chưa chọn</i>"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Thời gian gửi:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">${dateStr}</td>
                </tr>
                ${lead.sourceUrl ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Trang nguồn:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 12px; word-break: break-all;"><a href="${lead.sourceUrl}" target="_blank" style="color: #0066cc;">${lead.sourceUrl}</a></td>
                </tr>
                ` : ""}
              </tbody>
            </table>

            <h3 style="color: #0f3d2e; border-bottom: 2px solid #c99a4a; padding-bottom: 8px;">Lời nhắn chi tiết</h3>
            <div style="background-color: #f9f6f0; border-left: 4px solid #c99a4a; padding: 16px; border-radius: 4px; margin-bottom: 20px; font-style: italic; white-space: pre-wrap; color: #555;">${lead.message || "Không có lời nhắn."}</div>

            <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              <a href="https://hathanhhome.vn/admin" style="background-color: #0f3d2e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Truy cập trang Quản trị</a>
            </div>
          </div>
          <div style="background-color: #f5f5f5; color: #777; padding: 16px; text-align: center; font-size: 12px; border-top: 1px solid #e5e5e5;">
            Đây là email tự động gửi từ hệ thống CMS Hà Thành Home.<br />
            Vui lòng không phản hồi trực tiếp email này.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject: `[Hà Thành Home] Khách hàng đăng ký tư vấn mới: ${lead.fullName}`,
        html: htmlBody,
      });

      this.logger.log(`SMTP notification email sent successfully to ${toEmail} for lead #${lead.id}.`);
    } catch (error) {
      this.logger.error("Failed to send SMTP lead notification email:", error);
    }
  }
}

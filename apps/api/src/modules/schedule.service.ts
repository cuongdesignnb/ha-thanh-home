import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ContentStatus } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishDuePosts() {
    const now = new Date();
    const posts = await this.prisma.post.findMany({
      where: {
        status: ContentStatus.scheduled,
        scheduledAt: { lte: now },
      },
      take: 20,
    });

    for (const post of posts) {
      await this.prisma.post.update({
        where: { id: post.id },
        data: {
          status: ContentStatus.published,
          publishedAt: now,
        },
      });

      await this.prisma.activityLog.create({
        data: {
          action: "post.auto_published",
          entityType: "post",
          entityId: post.id,
          metadata: { scheduledAt: post.scheduledAt },
        },
      });
    }

    if (posts.length > 0) {
      this.logger.log(`Published ${posts.length} scheduled post(s).`);
    }
  }
}

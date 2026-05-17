import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AiController } from "./ai.controller";
import { AdminController } from "./admin.controller";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConstructionEstimatorAdminController, ConstructionEstimatorPublicController } from "./construction-estimator.controller";
import { ConstructionEstimatorService } from "./construction-estimator.service";
import { JwtGuard } from "./jwt.guard";
import { MediaController } from "./media.controller";
import { PrismaService } from "./prisma.service";
import { PublicController } from "./public.controller";
import { RolesGuard } from "./roles.guard";
import { ScheduleService } from "./schedule.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-only-change-me",
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as never },
    }),
  ],
  controllers: [AppController, AuthController, AdminController, PublicController, MediaController, AiController, ConstructionEstimatorPublicController, ConstructionEstimatorAdminController],
  providers: [AppService, AuthService, ConstructionEstimatorService, JwtGuard, RolesGuard, PrismaService, ScheduleService],
})
export class AppModule {}

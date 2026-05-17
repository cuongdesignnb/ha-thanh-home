import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) || true;

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), "..", "..", "storage", "uploads"), {
    prefix: "/uploads/",
  });

  const port = Number(process.env.PORT || process.env.API_PORT || 4000);
  await app.listen(port, "0.0.0.0");
}

bootstrap();

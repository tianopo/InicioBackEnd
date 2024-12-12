import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cors from "cors";
import * as dotenv from "dotenv";
import * as express from "express";
import { PayloadLimitInterceptor } from "./config/payload-limit-interceptor";
import { CustomError } from "./err/custom/Error.filter";
import { HttpExceptionFilter } from "./err/http-exception.filter";
import { AppModule } from "./modules/app.module";
import { CustomValidationPipe } from "./pipes/custom-validation.pipe";

const bootstrap = async () => {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Configuração do limite de payload do Express
  app.use(express.json({ limit: "50mb" })); // Para JSON
  app.use(express.urlencoded({ limit: "50mb", extended: true })); // Para dados URL-encoded

  app.useGlobalInterceptors(new PayloadLimitInterceptor());
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cors());

  process.on("unhandledRejection", (reason, promise) => {
    throw new CustomError(`Rejeição não tratada em: ${promise} reason: ${reason}`);
  });

  process.on("uncaughtException", (err) => {
    throw new CustomError(`Exceção não capturada lançada: ${err}`);
  });

  await app.listen(process.env.BACKEND_PORT ?? 3500);
};

bootstrap();

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CorsMiddleware } from "../middleware/cors.middleware";
import { AuthModule } from "./auth/auth.module";
import { ComplianceModule } from "./compliance/compliance.module";
import { LogModule } from "./log/log.module";
import { SendEmailModule } from "./send-email/send-email.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [AuthModule, UserModule, LogModule, SendEmailModule, ComplianceModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes("*");
  }
}

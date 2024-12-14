import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CorsMiddleware } from "../middleware/cors.middleware";
import { AuthModule } from "./auth/auth.module";
import { BuyerModule } from "./buyer/buyer.module";
import { ComplianceModule } from "./compliance/compliance.module";
import { EmailModule } from "./email/email.module";
import { LogModule } from "./log/log.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    AuthModule,
    UserModule,
    LogModule,
    EmailModule,
    ComplianceModule,
    BuyerModule,
    TransactionsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes("*");
  }
}

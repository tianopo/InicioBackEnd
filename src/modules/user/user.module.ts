import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
        ignoreUserAgents: [/localhost/],
      },
    ]),
  ],
})
export class UserModule {}

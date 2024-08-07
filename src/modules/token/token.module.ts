import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../auth/jwt.strategy";
import { UserModule } from "../user/user.module";
import { TokenService } from "./token.service";

@Module({
  providers: [TokenService, JwtStrategy],
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "15m",
      },
    }),
  ],
  exports: [TokenService],
})
export class TokenModule {}

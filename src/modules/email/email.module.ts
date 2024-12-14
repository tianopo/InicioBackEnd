import { Module } from "@nestjs/common";
import { TokenModule } from "../token/token.module";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [TokenModule],
})
export class EmailModule {}

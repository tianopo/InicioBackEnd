import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UnauthorizedException } from "../err/Unathorized.filter";

export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  handleRequest(err: Error, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException("Usuário não autorizado");
    }
    return user;
  }
}

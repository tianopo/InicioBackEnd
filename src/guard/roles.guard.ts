import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { Role, ROLES_KEY } from "../decorators/roles.decorator";
import { CustomError } from "../err/custom/Error.filter";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const user = context.switchToHttp().getRequest();
    const authorization = user.headers.authorization;
    if (!authorization) throw new CustomError("Token não fornecido");
    const token = authorization.replace("Bearer ", "");

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      if (!payload || !payload.id) throw new CustomError("Token inválido");

      const userAccess = payload.acesso;
      if (!payload.acesso) return false;

      return roles.some((role) => userAccess.includes(role));
    } catch (error) {
      throw new CustomError("Token inválido ou expirado");
    }
  }
}

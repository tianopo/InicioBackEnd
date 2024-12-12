import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { CustomError } from "../err/custom/Error.filter";

@Injectable()
export class PayloadLimitInterceptor implements NestInterceptor {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const contentLength = request.headers["content-length"];
    const maxPayloadSize = 50 * 1024 * 1024; // 50MB

    if (contentLength && parseInt(contentLength) > maxPayloadSize) {
      throw new CustomError("Payload deve ter o tamanho máximo de 50MB");
    }

    return next.handle();
  }
}

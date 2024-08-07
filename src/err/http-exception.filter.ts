import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { CustomError } from "./custom/Error.filter";
import { CustomValidator } from "./custom/Validator.filter";
import { ForbiddenException } from "./Forbidden.filter";
import { NotFound } from "./NotFound.filter";
import { UnauthorizedException } from "./Unathorized.filter";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly messages: Record<number, string> = {
    [HttpStatus.CONTINUE]: "Continuar",
    [HttpStatus.SWITCHING_PROTOCOLS]: "Mudando protocolos",
    [HttpStatus.PROCESSING]: "Processando",
    [HttpStatus.EARLYHINTS]: "Primeiras dicas",
    [HttpStatus.OK]: "OK",
    [HttpStatus.CREATED]: "Criado",
    [HttpStatus.ACCEPTED]: "Aceito",
    [HttpStatus.NON_AUTHORITATIVE_INFORMATION]: "Informação não autoritativa",
    [HttpStatus.NO_CONTENT]: "Sem conteúdo",
    [HttpStatus.RESET_CONTENT]: "Redefinir conteúdo",
    [HttpStatus.PARTIAL_CONTENT]: "Conteúdo parcial",
    [HttpStatus.AMBIGUOUS]: "Ambíguo",
    [HttpStatus.MOVED_PERMANENTLY]: "Movido permanentemente",
    [HttpStatus.FOUND]: "Encontrado",
    [HttpStatus.SEE_OTHER]: "Veja outro",
    [HttpStatus.NOT_MODIFIED]: "Não modificado",
    [HttpStatus.TEMPORARY_REDIRECT]: "Redirecionamento temporário",
    [HttpStatus.PERMANENT_REDIRECT]: "Redirecionamento permanente",
    [HttpStatus.BAD_REQUEST]: "Requisição inválida",
    [HttpStatus.UNAUTHORIZED]: "Usuário não autorizado",
    [HttpStatus.PAYMENT_REQUIRED]: "Pagamento necessário",
    [HttpStatus.FORBIDDEN]: "Você não tem permissão para acessar este recurso",
    [HttpStatus.NOT_FOUND]: "Recurso não encontrado",
    [HttpStatus.METHOD_NOT_ALLOWED]: "Método não permitido",
    [HttpStatus.NOT_ACCEPTABLE]: "Não aceitável",
    [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: "Autenticação de proxy necessária",
    [HttpStatus.REQUEST_TIMEOUT]: "Tempo de requisição esgotado",
    [HttpStatus.CONFLICT]: "Conflito de dados",
    [HttpStatus.GONE]: "Recurso não disponível",
    [HttpStatus.LENGTH_REQUIRED]: "Comprimento necessário",
    [HttpStatus.PRECONDITION_FAILED]: "Falha na pré-condição",
    [HttpStatus.PAYLOAD_TOO_LARGE]: "Carga útil muito grande",
    [HttpStatus.URI_TOO_LONG]: "URI muito longa",
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: "Tipo de mídia não suportado",
    [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]: "Intervalo solicitado não satisfatório",
    [HttpStatus.EXPECTATION_FAILED]: "Falha na expectativa",
    [HttpStatus.I_AM_A_TEAPOT]: "Eu sou um bule",
    [HttpStatus.MISDIRECTED]: "Redirecionado incorretamente",
    [HttpStatus.UNPROCESSABLE_ENTITY]: "Entidade não processável",
    [HttpStatus.FAILED_DEPENDENCY]: "Dependência falhou",
    [HttpStatus.PRECONDITION_REQUIRED]: "Pré-condição necessária",
    [HttpStatus.TOO_MANY_REQUESTS]: "Muitas requisições",
    [HttpStatus.INTERNAL_SERVER_ERROR]: "Erro interno do servidor",
    [HttpStatus.NOT_IMPLEMENTED]: "Não implementado",
    [HttpStatus.BAD_GATEWAY]: "Gateway inválido",
    [HttpStatus.SERVICE_UNAVAILABLE]: "Serviço indisponível",
    [HttpStatus.GATEWAY_TIMEOUT]: "Tempo de gateway esgotado",
    [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: "Versão HTTP não suportada",
  };

  private readonly customExceptionClasses = [
    CustomError,
    CustomValidator,
    ForbiddenException,
    NotFound,
    UnauthorizedException,
  ];

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const isCustomException = this.customExceptionClasses.some((cls) => exception instanceof cls);
    const message = isCustomException
      ? exception.message
      : this.messages[status] || exception.message || "Erro desconhecido";

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}

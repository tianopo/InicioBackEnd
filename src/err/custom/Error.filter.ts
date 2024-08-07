import { HttpException, HttpStatus } from "@nestjs/common";
import { LOG_COLORS } from "../../utils/logColors";

export class CustomError extends HttpException {
  constructor(message: string) {
    const error = new Error();
    const stackArray = error.stack?.split("\n");
    const stackLine = stackArray?.find((line) => line.includes("/modules/"))?.trim() || "";
    const filePath = stackLine.substring(stackLine.indexOf("/modules/"));
    const errorMessage = `${LOG_COLORS.bright + LOG_COLORS.red}Error: ${message} \nPath: ${filePath} `;

    super(message, HttpStatus.BAD_REQUEST);
    console.log(errorMessage);
  }
}

import type { AxiosResponse } from "axios";
import winston from "winston";

export class Logger {
  private static logger = winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({
        filename: "info.log",
        format: winston.format.simple()
      })
    ]
  });

  static error(err: string | Error | unknown, id: string) {
    if (typeof(err) === "string") {
      this.logger.error(this.toLogMessage(err, id));
      return;
    }
  
    if (err instanceof Error) {
      this.logger.error(this.toLogMessage(err.message, id));
      return;
    }

    this.logger.error(this.toLogMessage(JSON.stringify(err), id));
  }

  static info(message: string, id?: string) {
    this.logger.info(this.toLogMessage(message, id));
  }

  static response(res: AxiosResponse, id: string) {
    const method = res.config.method?.toUpperCase() ?? "";
    const path = res.config.url?.split("?")[0] ?? res.config.url ?? "";
    const status = res.status;

    this.info(`[OUT] ${method} ${path} ${status}`, id);
  }

  static responseError(
    url: string | undefined,
    methodName: string | undefined,
    statusNumber: number | undefined,
    id: string
  ) {
    const method = methodName?.toUpperCase() ?? "";
    const path = url?.split("?")[0] ?? url ?? "";
    const status = statusNumber ?? "";

    this.error(`[OUT] ${method} ${path} ${status}`, id);
  }

  private static toLogMessage(message: string, id?: string) {
    const date = new Date().toISOString();
    const idFallbacked = id ?? "--------------------------------";
    const formatted = `[${date}] [${idFallbacked}] ${message}`;
    return formatted.replace(/ {2}|\r\n|\n|\r/gm, " ");
  }
}

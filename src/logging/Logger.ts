import type { AxiosError, AxiosResponse } from "axios";
import winston from "winston";
import { loggingStorage } from "./loggingStorage";

export class Logger {
  private static logger = winston.createLogger({
    level: "debug",
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({
        filename: "./logs/info.log",
        format: winston.format.simple()
      })
    ]
  });

  static error(err: string | Error | unknown) {
    if (typeof err === "string") {
      this.logger.error(this.format(err));
      return;
    }

    if (err instanceof Error) {
      this.logger.error(this.format(err.stack ?? err.message));
      return;
    }

    this.logger.error(this.format(JSON.stringify(err)));
  }

  static info(message: string) {
    this.logger.info(this.format(message));
  }

  static debug(message: string) {
    this.logger.debug(this.format(message));
  }

  static httpResponse({ config, status }: AxiosResponse) {
    const method = config.method?.toUpperCase() ?? "";
    const path = config.url?.split("?")[0] ?? config.url ?? "";

    this.info(`[OUT] ${method} ${path} ${status}`);
  }

  static httpError({ config, response }: AxiosError) {
    const method = config?.method?.toUpperCase() ?? "";
    const path = config?.url?.split("?")[0] ?? config?.url ?? "";
    const status = response?.status ?? "";

    this.error(`[OUT] ${method} ${path} ${status}`);
  }

  private static format(message: string) {
    const timestamp = new Date().toISOString();
    const condensedMessage = message.replace(/ {2}|\r\n|\n|\r/gm, " ");

    const loggingStore = loggingStorage.getStore();
    const sessionId = loggingStore?.sessionId ?? "--------------------------------";
    const requestId = loggingStore?.requestId ?? "------------------------------------";

    return `[${timestamp}] [${sessionId}] [${requestId}] ${condensedMessage}`;
  }
}

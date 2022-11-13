import winston from "winston";

export class Logger {
  private static logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    level: "verbose",
    transports: [ new winston.transports.Console() ]
  });

  static error(err: string | Error | unknown, id?: string) {
    if (typeof(err) === "string") {
      this.logger.error(err, { id });
      return;
    }

    const standardError = err as Error;
    if (standardError.name === "Error") {
      this.logger.error(standardError.message, { id });
      return;
    }

    this.logger.error(JSON.stringify(err), { id });
  }

  static info(message: string, id?: string) {
    this.logger.info(message, { id });
  }

  static verbose(message: string, id?: string) {
    this.logger.verbose(message, { id });
  }
}

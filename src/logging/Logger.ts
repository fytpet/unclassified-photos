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

  static error(err: string | Error | unknown, id?: string) {
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

  private static toLogMessage(message: string, id?: string) {
    const date = new Date().toISOString();
    const idFallbacked = id ?? "--------------------------------";
    const formatted = `[${date}] [${idFallbacked}] ${message}`;
    return formatted.replace(/ {2}|\r\n|\n|\r/gm, " ");
  }
}

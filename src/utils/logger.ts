import winston from "winston";

const consoleTransport = new winston.transports.Console();

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors(),
    winston.format.json(),
    winston.format.colorize({ all: true })
  ),
  level: "verbose",
  transports: [
    consoleTransport
  ]
});

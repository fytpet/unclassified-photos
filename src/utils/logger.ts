import winston from "winston";

const consoleTransport = new winston.transports.Console();

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  level: "verbose",
  transports: [
    consoleTransport
  ]
});

import type { NextFunction, Request, Response } from "express";
import { Logger } from "../../logging/Logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const url = req.originalUrl.split("?")[0] ?? req.originalUrl;
    Logger.info(`[IN] ${req.method} ${url} ${res.statusCode}`);
  });

  next();
}

import type { NextFunction, Request, Response } from "express";
import { Logger } from "../../logging/Logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const url = req.url.split("?")[0] ?? req.url;
    Logger.info(`[IN] ${req.method} ${url} ${res.statusCode}`, req.sessionID);
  });

  next();
}

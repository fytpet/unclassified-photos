import { NextFunction, Request, Response } from "express";
import { Logger } from "../utils/Logger";
import { withoutQuery } from "../utils/url";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    Logger.info(`[IN] ${req.method} ${withoutQuery(req.url)} ${res.statusCode}`, req.sessionID);
  });

  next();
}

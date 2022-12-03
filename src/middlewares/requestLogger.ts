import { NextFunction, Request, Response } from "express";
import { Logger } from "../logging/Logger";
import { URL } from "../network/utils";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const url = new URL(req.url).withoutQueryString();
    Logger.info(`[IN] ${req.method} ${url} ${res.statusCode}`, req.sessionID);
  });

  next();
}

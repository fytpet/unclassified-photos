import type { Request, Response } from "express";
import { Logger } from "../../logging/Logger";

export function unsecureHandler(req: Request, res: Response) {
  let redirectRoute = `${process.env.BASE_URI}${req.originalUrl}`;
  if (req.headers.host) {
    redirectRoute = `https://${req.headers.host}${req.originalUrl}`;
  }
  Logger.info(`Redirecting unsecure request to ${redirectRoute}`);
  res.status(301).redirect(redirectRoute);
}

import type { NextFunction, Request, Response } from "express";
import { Logger } from "../../logging/Logger";

export function redirectHandler(req: Request, res: Response, next: NextFunction) {
  if (process.env.HTTPS === "yes" && !req.secure) {
    let redirectRoute = `${process.env.BASE_URI}${req.originalUrl}`;
    if (req.headers.host) {
      redirectRoute = `https://${req.headers.host}${req.originalUrl}`;
    }
    Logger.info(`Redirecting unsecure request to ${redirectRoute}`);
    res.redirect(redirectRoute);
  } else {
    next();
  }
}

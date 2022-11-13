import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(err.message);
  req.session.error = err.message;
  req.session.destroy((err) => logger.error(err));
  res.redirect("/sign-in");
}

import { NextFunction, Request, Response } from "express";
import { Logger } from "../../logging/Logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  Logger.error(err, req.sessionID);
  req.session.error = err.message;

  if (res.headersSent) {
    return next(err);
  }

  delete req.session.bearer;
  res.redirect("/sign-in");
}

import { NextFunction, Request, Response } from "express";
import { Logger } from "../utils/Logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  Logger.error(err, req.sessionID);

  req.session.error = err.message;
  delete req.session.bearer;

  res.redirect("/sign-in");
}

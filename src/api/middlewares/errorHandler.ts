import type { NextFunction, Request, Response } from "express";
import { GENERIC_ERR_MSG } from "../../exceptions/errorMessages";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError";
import { Logger } from "../../logging/Logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  Logger.error(err);

  req.session.error = err instanceof UserFriendlyError ? err.message : GENERIC_ERR_MSG;

  if (res.headersSent) {
    return next(err);
  }

  req.session.destroy((err) => {
    if (err) Logger.error(err);
  });
  res.redirect("/sign-in");
}

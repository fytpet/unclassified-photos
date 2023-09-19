import type { NextFunction, Request, Response } from "express";
import { GENERIC_ERR_MSG } from "../../exceptions/errorMessages.js";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError.js";
import { Logger } from "../../logging/Logger.js";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  Logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  req.session.regenerate((regenerateError) => {
    if (regenerateError) Logger.error(regenerateError);
    req.session.error = err instanceof UserFriendlyError ? err.message : GENERIC_ERR_MSG;
    res.redirect("/sign-in");
  });
}

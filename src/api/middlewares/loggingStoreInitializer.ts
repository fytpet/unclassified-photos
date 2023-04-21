import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { LoggingStorage } from "../../logging/AsyncLocalStorage";

export function loggingStoreInitializer(req: Request, _: Response, next: NextFunction) {
  const store = {
    requestId: randomUUID(),
    sessionId: req.sessionID
  };

  LoggingStorage.run(store, () => next());
}

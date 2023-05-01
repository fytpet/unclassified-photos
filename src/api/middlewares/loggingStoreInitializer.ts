import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { loggingStorage } from "../../logging/loggingStorage";

export function loggingStoreInitializer(req: Request, _: Response, next: NextFunction) {
  const store = {
    requestId: randomUUID(),
    sessionId: req.sessionID
  };

  loggingStorage.run(store, () => next());
}

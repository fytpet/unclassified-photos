import { AsyncLocalStorage } from "async_hooks";

interface LoggingStore {
  requestId?: string;
  sessionId?: string;
}

export const loggingStorage = new AsyncLocalStorage<LoggingStore>();

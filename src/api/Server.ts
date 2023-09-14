import type { RequestHandler } from "express";
import express from "express";
import type { Server as HttpServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Logger } from "../logging/Logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { helmetHandler } from "./middlewares/helmetHandler.js";
import { loggingStoreInitializer } from "./middlewares/loggingStoreInitializer.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { session } from "./middlewares/session.js";
import { oauthRouter } from "./routes/oauthRouter.js";
import { router } from "./routes/router.js";

export class Server {
  private app = express();
  private server: HttpServer | undefined;

  constructor(middleware: RequestHandler = (_, __, next) => next()) {
    this.app.set("views", path.join(fileURLToPath(import.meta.url), "../views"));
    this.app.set("view engine", "ejs");
    this.app.disable("x-powered-by");
    this.app.use(helmetHandler);
    this.app.use(session);
    this.app.use(loggingStoreInitializer);
    this.app.use(express.static("./public"));
    this.app.use(requestLogger);
    this.app.use(middleware);
    this.app.use("/oauth", oauthRouter);
    this.app.use("/", router);
    this.app.use(errorHandler);
  }

  start() {
    const port = process.env.PORT;
    this.server = this.app.listen(port, () => Logger.info(`Server listening on ${port}`));
  }

  close() {
    if (this.server) this.server.close();
  }
}

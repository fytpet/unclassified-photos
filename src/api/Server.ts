import type { RequestHandler } from "express";
import express from "express";
import fs from "fs";
import type { Server as HttpServer } from "http";
import { createServer } from "https";
import path from "path";
import { Logger } from "../logging/Logger";
import { errorHandler } from "./middlewares/errorHandler";
import { helmetHandler } from "./middlewares/helmetHandler";
import { loggingStoreInitializer } from "./middlewares/loggingStoreInitializer";
import { unsecureHandler } from "./middlewares/unsecureHandler";
import { requestLogger } from "./middlewares/requestLogger";
import { session } from "./middlewares/session";
import { oauthRouter } from "./routes/oauthRouter";
import { router } from "./routes/router";

export class Server {
  private port = process.env.PORT;
  private app = express();
  private server: HttpServer | undefined;
  private gatekeeper: HttpServer | undefined;

  constructor(middleware: RequestHandler = (_, __, next) => next()) {
    this.app.set("views", path.join(__dirname, "./views"));
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
    if (process.env.HTTPS === "yes") {
      this.startSecure();
    } else {
      this.server = this.app.listen(this.port);
    }
    Logger.info(`Server listening on ${this.port}`);
  }

  close() {
    if (this.server) {
      this.server.close();
    }
    if (this.gatekeeper) {
      this.gatekeeper.close();
    }
  }

  private startSecure() {
    this.server = createServer({
      key: fs.readFileSync("./ssl/privkey.pem"),
      cert: fs.readFileSync("./ssl/fullchain.pem"),
    }, this.app).listen(this.port);

    this.gatekeeper = express()
      .use(unsecureHandler)
      .listen(this.port);
  }
}

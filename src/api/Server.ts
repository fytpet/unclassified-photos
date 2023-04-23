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
import { requestLogger } from "./middlewares/requestLogger";
import { session } from "./middlewares/session";
import { unsecureHandler } from "./middlewares/unsecureHandler";
import { oauthRouter } from "./routes/oauthRouter";
import { router } from "./routes/router";

export class Server {
  private httpPort = process.env.HTTP_PORT;
  private httpsPort = process.env.HTTPS_PORT;
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
    process.env.NODE_ENV === "production"
      ? this.startProduction()
      : this.startDevelopment();
  }

  close() {
    if (this.server) this.server.close();
    if (this.gatekeeper) this.gatekeeper.close();
  }

  private startProduction() {
    this.server = createServer({
      key: fs.readFileSync("./ssl/privkey.pem"),
      cert: fs.readFileSync("./ssl/fullchain.pem"),
    }, this.app);
  
    this.server.listen(this.httpsPort, () => Logger.info(`Production server listening on ${this.httpsPort}`));

    this.startGatekeeper();
  }

  private startGatekeeper() {
    this.gatekeeper = express()
      .use(unsecureHandler)
      .listen(this.httpPort, () => Logger.info(`Gatekeeper listening on ${this.httpPort}`));
  }

  private startDevelopment() {
    this.server = this.app.listen(this.httpPort, () => Logger.info(`Development server listening on ${this.httpPort}`));
  }
}

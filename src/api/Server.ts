import type { RequestHandler } from "express";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import type { Server as HttpServer } from "http";
import { createServer } from "https";
import path from "path";
import { Logger } from "../logging/Logger";
import { errorHandler } from "./middlewares/errorHandler";
import { loggingStoreInitializer } from "./middlewares/loggingStoreInitializer";
import { requestLogger } from "./middlewares/requestLogger";
import { session } from "./middlewares/session";
import { oauthRouter } from "./routes/oauthRouter";
import { router } from "./routes/router";

export class Server {
  private port = process.env.PORT;
  private app = express();
  private server: HttpServer | undefined;

  constructor(middleware: RequestHandler = (_, __, next) => next()) {
    const helmetConfig = {
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": ["'self'", "https://lh3.googleusercontent.com"],
        }
      },
      crossOriginEmbedderPolicy: false,
    };

    this.app.set("views", path.join(__dirname, "./views"));
    this.app.set("view engine", "ejs");
    this.app.disable("x-powered-by");
    this.app.use(helmet(helmetConfig));
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
      this.server = createServer({
        key: fs.readFileSync("./ssl/privkey.pem"),
        cert: fs.readFileSync("./ssl/fullchain.pem"),
      }, this.app).listen(this.port);
    } else {
      this.server = this.app.listen(this.port);
    }
    Logger.info(`Server listening on ${this.port}`);
  }

  close() {
    if (this.server) {
      this.server.close();
    }
  }
}

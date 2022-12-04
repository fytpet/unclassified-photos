import express, { RequestHandler } from "express";
import { IncomingMessage, Server, ServerResponse } from "http";
import path from "path";
import { Logger } from "../logging/Logger";
import { errorHandler } from "../middlewares/errorHandler";
import { requestLogger } from "../middlewares/requestLogger";
import { session } from "../middlewares/session";
import { router } from "../routes/routes";

export class UnclassifiedPhotosServer {
  private port = process.env.PORT;
  private app = express();
  private server: Server<typeof IncomingMessage, typeof ServerResponse> | undefined;

  constructor(middleware?: RequestHandler) {
    this.app.set("views", path.join(__dirname, "../views"));
    this.app.set("view engine", "ejs");
    this.app.use(session);
    this.app.use(express.static("./public"));
    this.app.use(requestLogger);
    if (middleware) {
      this.app.use(middleware);
    }
    this.app.use("/", router);
    this.app.use(errorHandler);
  }

  start() {
    this.server = this.app.listen(this.port);
    Logger.info(`Server listening on ${this.port}`);
  }

  close() {
    if (this.server) {
      this.server.close();
    }
  }
}

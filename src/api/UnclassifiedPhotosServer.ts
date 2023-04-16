import express, { RequestHandler } from "express";
import fs from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";
import { createServer } from "https";
import path from "path";
import { Logger } from "../logging/Logger";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import { session } from "./middlewares/session";
import { oauthRouter } from "./routes/oauthRouter";
import { router } from "./routes/router";

export class UnclassifiedPhotosServer {
  private port = process.env.PORT;
  private app = express();
  private server: Server<typeof IncomingMessage, typeof ServerResponse> | undefined;

  constructor(middleware: RequestHandler = (_, __, next) => next()) {
    this.app.set("views", path.join(__dirname, "./views"));
    this.app.set("view engine", "ejs");
    this.app.use(session);
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

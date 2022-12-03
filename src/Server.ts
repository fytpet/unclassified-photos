import express from "express";
import path from "path";
import { Logger } from "./logging/Logger";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import { session } from "./middlewares/session";
import { router } from "./routes/routes";

export class Server {
  private app = express();

  constructor() {
    this.app.set("views", path.join(__dirname, "/views"));
    this.app.set("view engine", "ejs");
    this.app.use(session);
    this.app.use(express.static("./public"));
    this.app.use(requestLogger);
    this.app.use("/", router);
    this.app.use(errorHandler);
  }

  start() {
    const port = process.env.PORT;
    Logger.info(`Server listening on ${port}`);
    this.app.listen(port);
  }
}

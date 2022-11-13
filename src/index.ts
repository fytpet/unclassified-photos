import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import session from "express-session";
import { router } from "./routes/routes";
import { logger } from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(express.static("./public"));
app.use("/", router);
app.use(errorHandler);

const port = process.env.PORT;
logger.info(`Server listening on ${port}`);
app.listen(port);

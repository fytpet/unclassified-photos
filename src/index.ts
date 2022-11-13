import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { errorHandler } from "./middlewares/errorHandler";
import { session } from "./middlewares/session";
import { router } from "./routes/routes";
import { Logger } from "./utils/Logger";

const app = express();

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(session);
app.use(express.static("./public"));
app.use("/", router);
app.use(errorHandler);

const port = process.env.PORT;
Logger.info(`Server listening on ${port}`);
app.listen(port);

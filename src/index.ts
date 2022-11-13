import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import { router } from "./routes/routes";
import { logger } from "./utils/logger";

const app = express();

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static("./public"));
app.use("/", router);

const port = process.env.PORT;
logger.info(`Server listening on ${port}`);
app.listen(port);

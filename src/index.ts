import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import express from "express";
import { router } from "./routes/routes";
import { logger } from "./utils/logger";

const app = express();

app.use(cookieParser());
app.use(express.static("./src/public"));
app.use("/", router);

const port = process.env.PORT;
logger.info(`Server listening on ${port}`);
app.listen(port);

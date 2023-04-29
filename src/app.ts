import dotenv from "dotenv";
dotenv.config({ path: "../env/.env" });

import { Server } from "./api/Server";

new Server().start();

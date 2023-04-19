import dotenv from "dotenv";
dotenv.config();

import { Server } from "./api/Server";

new Server().start();

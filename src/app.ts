import "./config.js";

import { collectDefaultMetrics } from "prom-client";
import { Server } from "./api/Server.js";

collectDefaultMetrics();

new Server().start();

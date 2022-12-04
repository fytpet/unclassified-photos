import dotenv from "dotenv";
dotenv.config();

import { UnclassifiedPhotosServer } from "./server/Server";

new UnclassifiedPhotosServer().start();

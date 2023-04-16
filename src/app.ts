import dotenv from "dotenv";
dotenv.config();

import { UnclassifiedPhotosServer } from "./api/Server";

new UnclassifiedPhotosServer().start();

import dotenv from "dotenv";
dotenv.config();

import { UnclassifiedPhotosServer } from "./api/UnclassifiedPhotosServer";

new UnclassifiedPhotosServer().start();

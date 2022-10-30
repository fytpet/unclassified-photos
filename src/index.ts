import { AxiosError } from "axios";
import { findUnclassifiedPhotos } from "./findUnclassifiedPhotos";
import { logger } from "./utils/logger";
import { writeToFile } from "./utils/writeToFile";

async function main() {
  writeToFile(await findUnclassifiedPhotos());
}

void main().catch((error: AxiosError) => logger.error(JSON.stringify(error, null, 2)));

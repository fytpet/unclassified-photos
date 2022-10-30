import { findUnclassifiedPhotos } from "./findUnclassifiedPhotos";
import { authenticate } from "./network/authenticate";
import { logger } from "./utils/logger";
import { writeToFile } from "./utils/writeToFile";

async function main() {
  await authenticate();
  const unclassifiedPhotos = await findUnclassifiedPhotos();
  writeToFile(unclassifiedPhotos);
}

void main().catch((error) => {
  logger.error(error);
});

import FileSystem from "fs";
import { Photo } from "../types/types";
import { logger } from "./logger";

const OUTPUT_FILE = "./output.json";

export function writeToFile(photos: Photo[]) {
  FileSystem.writeFile(
    OUTPUT_FILE,
    JSON.stringify(photos, null, 2),
    (error) => {
      if (error) throw error;
      logger.info(`Output saved to ${OUTPUT_FILE}`);
    }
  );
}

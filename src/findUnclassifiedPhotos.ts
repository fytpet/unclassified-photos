import { getAlbums } from "./network/getAlbums";
import { getPhotos } from "./network/getPhotos";
import { getPhotosOfAlbum } from "./network/getPhotosOfAlbum";
import { logger } from "./utils/logger";

export async function findUnclassifiedPhotos() {
  const photos = await getPhotos();
  const classifiedIds = new Set<string>();

  for (const album of await getAlbums()) {
    const albumPhotos = await getPhotosOfAlbum(album);
    albumPhotos.forEach((albumPhoto) => classifiedIds.add(albumPhoto.id));
  }

  const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));
  logger.info(`Found ${unclassifiedPhotos.length} unclassified photos.`);
  return unclassifiedPhotos;
}

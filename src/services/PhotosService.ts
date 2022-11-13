import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { logger } from "../utils/logger";

export class PhotosService {
  static async findUnclassifiedPhotos(accessToken: string) {
    const photos = await PhotosLibraryClient.getPhotos(accessToken);
    const albums = await PhotosLibraryClient.getAlbums(accessToken);
  
    const classifiedIds = new Set<string>();
  
    for (const album of albums) {
      const albumPhotos = await PhotosLibraryClient.getPhotosOfAlbum(album, accessToken);
      albumPhotos.forEach((albumPhoto) => classifiedIds.add(albumPhoto.id));
    }
  
    const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));
    logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`);
    return unclassifiedPhotos;
  }
}

import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { logger } from "../utils/logger";

export class PhotosService {
  static async findUnclassifiedPhotos(accessToken: string) {
    const [photos, albums] = await Promise.all([
      PhotosLibraryClient.getPhotos(accessToken),
      PhotosLibraryClient.getAlbums(accessToken)
    ]);
  
    const classifiedIds = new Set<string>();

    const photosInAlbums = await Promise.all(
      albums.map((album) => PhotosLibraryClient.getPhotosOfAlbum(album, accessToken))
    );

    photosInAlbums.flat().forEach((albumPhoto) => classifiedIds.add(albumPhoto.id));
  
    const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));

    logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`);
    return unclassifiedPhotos;
  }
}

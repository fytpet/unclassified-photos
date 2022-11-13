import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { logger } from "../utils/logger";

export class PhotosService {
  private client = new PhotosLibraryClient();

  async findUnclassifiedPhotos(authCode: string) {
    const accessToken = await this.client.createAccessToken(authCode);
    const photos = await this.client.getPhotos(accessToken);
    const albums = await this.client.getAlbums(accessToken);
  
    const classifiedIds = new Set<string>();
  
    for (const album of albums) {
      const albumPhotos = await this.client.getPhotosOfAlbum(album, accessToken);
      albumPhotos.forEach((albumPhoto) => classifiedIds.add(albumPhoto.id));
    }
  
    const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));
    logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`);
    return unclassifiedPhotos;
  }
}

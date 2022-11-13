import { PhotosApiClient } from "../network/PhotosApiClient";
import { logger } from "../utils/logger";

export class PhotosService {
  private photosApiClient = new PhotosApiClient();

  async findUnclassifiedPhotos(authCode: string) {
    const accessToken = await this.photosApiClient.createAccessToken(authCode);
    const photos = await this.photosApiClient.getPhotos(accessToken);
    const albums = await this.photosApiClient.getAlbums(accessToken);
  
    const classifiedIds = new Set<string>();
  
    for (const album of albums) {
      const albumPhotos = await this.photosApiClient.getPhotosOfAlbum(album, accessToken);
      albumPhotos.forEach((albumPhoto) => classifiedIds.add(albumPhoto.id));
    }
  
    const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));
    logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`);
    return unclassifiedPhotos;
  }
}

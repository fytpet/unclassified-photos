import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { Session } from "../types/types";
import { Logger } from "../utils/Logger";

export class PhotosService {
  static async findUnclassifiedPhotos(sessionInfo: Session) {
    const albums = await PhotosLibraryClient.getAlbums(sessionInfo);
    const photos = await PhotosLibraryClient.getPhotos(sessionInfo);
  
    const classifiedIds = new Set<string>();

    const photosInAlbums = await Promise.all(
      albums.map((album) => PhotosLibraryClient.getPhotosOfAlbum(album, sessionInfo))
    );

    photosInAlbums.flat().forEach((albumPhoto) => classifiedIds.add(albumPhoto.id));
  
    const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));

    Logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`, sessionInfo.id);
    return unclassifiedPhotos;
  }
}

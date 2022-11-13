import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { Session } from "../types/types";
import { Logger } from "../utils/Logger";

export class PhotosService {
  static async findUnclassifiedPhotos(sessionInfo: Session) {


    const [photos, albums] = await Promise.all([
      PhotosLibraryClient.getPhotos(sessionInfo),
      PhotosLibraryClient.getAlbums(sessionInfo)
    ]);
  
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

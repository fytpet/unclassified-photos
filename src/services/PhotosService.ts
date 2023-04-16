import { Logger } from "../logging/Logger";
import { PhotosCursor } from "../network/PhotosCursor";
import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { Photo, Session } from "../types/types";

const MAXIMUM_UNCLASSIFIED_PHOTOS_COUNT = 100;

export class PhotosService {
  private readonly photosLibraryClient;
  private readonly session: Session;

  constructor(session: Session) {
    this.photosLibraryClient = new PhotosLibraryClient(session);
    this.session = session;
  }

  async findUnclassifiedPhotos() {
    const albums = await this.photosLibraryClient.fetchAllAlbums();
    const albumPhotos = await Promise.all(albums.map((album) => this.photosLibraryClient.fetchAllPhotosOfAlbum(album)));
    const classifiedIds = new Set<string>(albumPhotos.flat().map((albumPhoto) => albumPhoto.id));

    let unclassifiedPhotos: Photo[] = [];
    const cursor = new PhotosCursor(this.photosLibraryClient);
  
    do {
      const photos = await cursor.readNextPage();
      unclassifiedPhotos = unclassifiedPhotos.concat(photos.filter((photo) => !classifiedIds.has(photo.id)));

      if (unclassifiedPhotos.length > MAXIMUM_UNCLASSIFIED_PHOTOS_COUNT) {
        unclassifiedPhotos.splice(MAXIMUM_UNCLASSIFIED_PHOTOS_COUNT);
        break;
      }
    } while (cursor.hasNextPage());

    Logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`, this.session.id);
    return unclassifiedPhotos;
  }
}

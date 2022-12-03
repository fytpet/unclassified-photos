import { Logger } from "../logging/Logger";
import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { Session } from "../types/types";

export class PhotosService {
  private readonly photosLibraryClient;
  private readonly session: Session;

  constructor(session: Session) {
    this.photosLibraryClient = new PhotosLibraryClient(session);
    this.session = session;
  }

  async findUnclassifiedPhotos() {
    const albums = await this.photosLibraryClient.fetchAlbums();
    const photos = await this.photosLibraryClient.fetchPhotos();
    const albumPhotos = await Promise.all(albums.map((album) => this.photosLibraryClient.fetchPhotosOfAlbum(album)));

    const classifiedIds = new Set<string>(albumPhotos.flat().map((albumPhoto) => albumPhoto.id));
  
    const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));

    Logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`, this.session.id);
    return unclassifiedPhotos;
  }
}

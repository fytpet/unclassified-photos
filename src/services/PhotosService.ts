import { PhotosLibraryClient } from "../network/PhotosLibraryClient";
import { Session } from "../types/types";
import { Logger } from "../utils/Logger";

export class PhotosService {
  private photosLibraryClient;
  private session: Session;

  constructor(session: Session) {
    this.photosLibraryClient = new PhotosLibraryClient(session);
    this.session = session;
  }

  async findUnclassifiedPhotos() {
    const albums = await this.photosLibraryClient.getAlbums();
    const photos = await this.photosLibraryClient.getPhotos();
  
    const classifiedIds = new Set<string>();

    const photosInAlbums = await Promise.all(
      albums.map((album) => this.photosLibraryClient.getPhotosOfAlbum(album))
    );

    photosInAlbums.flat().forEach((albumPhoto) => classifiedIds.add(albumPhoto.id));
  
    const unclassifiedPhotos = photos.filter((photo) => !classifiedIds.has(photo.id));

    Logger.info(`Found ${unclassifiedPhotos.length} unclassified photos`, this.session.id);
    return unclassifiedPhotos;
  }
}

import type { Photo } from "../../types/types.js";
import type { PhotosLibraryClient} from "../clients/PhotosLibraryClient.js";
import { SEARCH_PAGE_SIZE } from "../clients/PhotosLibraryClient.js";
import { PhotosLibrarySearchParams } from "../utils/PhotosLibrarySearchParams.js";
import { PhotosLibraryCursor } from "./PhotosLibraryCursor.js";

export class PhotosCursor extends PhotosLibraryCursor<Photo> {
  constructor(client: PhotosLibraryClient) {
    super(
      new PhotosLibrarySearchParams(SEARCH_PAGE_SIZE),
      client.fetchPhotos
    );
  }
}

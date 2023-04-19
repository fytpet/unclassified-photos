import type { Photo } from "../../types/types";
import type { PhotosLibraryClient} from "../clients/PhotosLibraryClient";
import { SEARCH_PAGE_SIZE } from "../clients/PhotosLibraryClient";
import { PhotosLibrarySearchParams } from "../utils/PhotosLibrarySearchParams";
import { PhotosLibraryCursor } from "./PhotosLibraryCursor";

export class PhotosCursor extends PhotosLibraryCursor<Photo> {
  constructor(client: PhotosLibraryClient) {
    super(
      new PhotosLibrarySearchParams(SEARCH_PAGE_SIZE),
      client.fetchPhotos
    );
  }
}

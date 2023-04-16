import { Photo } from "../types/types";
import { PhotosLibraryClient, SEARCH_PAGE_SIZE } from "./PhotosLibraryClient";
import { PhotosLibraryCursor } from "./PhotosLibraryCursor";
import { PhotosLibrarySearchParams } from "./PhotosLibrarySearchParams";

export class PhotosCursor extends PhotosLibraryCursor<Photo> {
  constructor(client: PhotosLibraryClient) {
    super(
      new PhotosLibrarySearchParams(SEARCH_PAGE_SIZE),
      client.fetchPhotos
    );
  }
}

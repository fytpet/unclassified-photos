import type { Album, AlbumsResponse, Photo, PhotosResponse } from "../../types/types";
import { PhotosLibraryCursor } from "../cursors/PhotosLibraryCursor";
import { PhotosLibrarySearchParams } from "../utils/PhotosLibrarySearchParams";
import { ApiClient } from "./ApiClient";

const ALBUM_PAGE_SIZE = 50;
export const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  private readonly apiClient: ApiClient;

  constructor(accessToken: string) {
    this.apiClient = new ApiClient(accessToken);
  }

  fetchPhotos = async (params: PhotosLibrarySearchParams) => {
    const { data } = await this.apiClient.get<PhotosResponse>(`/v1/mediaItems?${params.toString()}`);
    return { results: data.mediaItems, nextPageToken: data.nextPageToken };
  };

  fetchAlbums = async (params: PhotosLibrarySearchParams) => {
    const { data } = await this.apiClient.get<AlbumsResponse>(`/v1/albums?${params.toString()}`);
    return { results: data.albums, nextPageToken: data.nextPageToken };
  };

  fetchPhotosOfAlbum = async (params: PhotosLibrarySearchParams) => {
    const { data } = await this.apiClient.post<PhotosResponse>(`/v1/mediaItems:search?${params.toString()}`);
    return { results: data.mediaItems, nextPageToken: data.nextPageToken };
  };

  async fetchAllAlbums() {  
    const cursor = new PhotosLibraryCursor<Album>(
      new PhotosLibrarySearchParams(ALBUM_PAGE_SIZE),
      this.fetchAlbums
    );

    return cursor.readAll();
  }

  async fetchAllPhotosOfAlbum(album: Album) {
    const cursor = new PhotosLibraryCursor<Photo>(
      new PhotosLibrarySearchParams(SEARCH_PAGE_SIZE, album.id),
      this.fetchPhotosOfAlbum
    );

    return cursor.readAll();
  }
}

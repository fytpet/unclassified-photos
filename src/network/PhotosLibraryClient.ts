import { Album, AlbumsResponse, ItemsResponse, Photo, PhotosResponse, Session } from "../types/types";
import { ApiClient } from "./ApiClient";
import { PhotosLibrarySearchParams } from "./PhotosLibrarySearchParams";

const ALBUM_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  private apiClient: ApiClient;

  constructor(session: Session) {
    this.apiClient = new ApiClient(session);
  }

  async fetchPhotos() {
    return this.fetchAllPages<Photo>(
      new PhotosLibrarySearchParams(SEARCH_PAGE_SIZE),
      async (params: URLSearchParams) => {
        const response = await this.apiClient.get<PhotosResponse>(`/v1/mediaItems?${params.toString()}`);
        return { items: response.data.mediaItems, nextPageToken: response.data.nextPageToken };
      }
    );
  }

  async fetchAlbums() {  
    return this.fetchAllPages<Album>(
      new PhotosLibrarySearchParams(ALBUM_PAGE_SIZE),
      async (params: URLSearchParams) => {
        const response = await this.apiClient.get<AlbumsResponse>(`/v1/albums?${params.toString()}`);
        return { items: response.data.albums, nextPageToken: response.data.nextPageToken };
      }
    );
  }

  async fetchPhotosOfAlbum(album: Album) {  
    return this.fetchAllPages<Photo>(
      new PhotosLibrarySearchParams(SEARCH_PAGE_SIZE, album.id),
      async (params: URLSearchParams) => {
        const response = await this.apiClient.post<PhotosResponse>(`/v1/mediaItems:search?${params.toString()}`);
        return { items: response.data.mediaItems, nextPageToken: response.data.nextPageToken };
      }
    );
  }

  private async fetchAllPages<T>(
    params: PhotosLibrarySearchParams,
    fetchPage: (p: URLSearchParams) => Promise<ItemsResponse<T>>
  ) {
    let items: T[] = [];
  
    do {
      const data = await fetchPage(params);
      items = items.concat(data.items.filter((item) => !!item));
      params.goToNextPage(data.nextPageToken);
    } while (params.has("pageToken"));
  
    return items;
  }
}

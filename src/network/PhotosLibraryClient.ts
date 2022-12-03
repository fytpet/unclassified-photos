import { Album, AlbumsResponse, ItemsResponse, Photo, PhotosResponse, Session } from "../types/types";
import { ApiClient } from "./ApiClient";

const ALBUM_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  private apiClient: ApiClient;

  constructor(session: Session) {
    this.apiClient = new ApiClient(session);
  }

  async getPhotos() {
    return this.fetchAllPages<Photo>(SEARCH_PAGE_SIZE, async (params: URLSearchParams) => {
      const response = await this.apiClient.get<PhotosResponse>(`/v1/mediaItems?${params.toString()}`);
      return { items: response.data.mediaItems, nextPageToken: response.data.nextPageToken };
    });
  }

  async getAlbums() {  
    return this.fetchAllPages<Album>(ALBUM_PAGE_SIZE, async (params: URLSearchParams) => {
      const response = await this.apiClient.get<AlbumsResponse>(`/v1/albums?${params.toString()}`);
      return { items: response.data.albums, nextPageToken: response.data.nextPageToken };
    });
  }

  async getPhotosOfAlbum(album: Album) {  
    return this.fetchAllPages<Photo>(SEARCH_PAGE_SIZE, async (params: URLSearchParams) => {
      const response = await this.apiClient.post<PhotosResponse>(`/v1/mediaItems:search?${params.toString()}`);
      return { items: response.data.mediaItems, nextPageToken: response.data.nextPageToken };
    }, album.id);
  }

  private async fetchAllPages<T>(pageSize: number, fetchPage: (p: URLSearchParams) => Promise<ItemsResponse<T>>, albumId?: string) {
    let items: T[] = [];
    const params = new URLSearchParams();
    params.append("pageSize", pageSize.toString());
  
    if (albumId) {
      params.append("albumId", albumId);
    }
  
    do {
      const data = await fetchPage(params);
      items = items.concat(data.items.filter((item) => !!item));
      this.goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    return items;
  }
  
  private goToNextPage(params: URLSearchParams, nextPageToken: string) {
    if (nextPageToken) {
      params.set("pageToken", nextPageToken);
    } else {
      params.delete("pageToken");
    }
  }
}

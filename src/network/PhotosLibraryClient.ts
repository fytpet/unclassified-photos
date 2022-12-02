import { Album, AlbumsResponse, ItemsResponse, Photo, PhotosResponse, Session } from "../types/types";
import { ApiClient } from "./apiClient";

const ALBUM_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  static async getPhotos(session: Session) {
    return fetchAllPages<Photo>(SEARCH_PAGE_SIZE, async (params: URLSearchParams) => {
      const response = await ApiClient.get<PhotosResponse>(
        `/v1/mediaItems?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } },
        session.id
      );
      return { items: response.data.mediaItems, nextPageToken: response.data.nextPageToken };
    });
  }

  static async getAlbums(session: Session) {  
    return fetchAllPages<Album>(ALBUM_PAGE_SIZE, async (params: URLSearchParams) => {
      const response = await ApiClient.get<AlbumsResponse>(
        `/v1/albums?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } },
        session.id
      );
      return { items: response.data.albums, nextPageToken: response.data.nextPageToken };
    });
  }

  static async getPhotosOfAlbum(album: Album, session: Session) {  
    return fetchAllPages<Photo>(SEARCH_PAGE_SIZE, async (params: URLSearchParams) => {
      const response = await ApiClient.post<PhotosResponse>(
        `/v1/mediaItems:search?${params.toString()}`,
        undefined,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } },
        session.id
      );
      return { items: response.data.mediaItems, nextPageToken: response.data.nextPageToken };
    }, album.id);
  }
}

async function fetchAllPages<T>(pageSize: number, fetchPage: (p: URLSearchParams) => Promise<ItemsResponse<T>>, albumId?: string) {
  let items: T[] = [];
  const params = new URLSearchParams();
  params.append("pageSize", pageSize.toString());

  if (albumId) {
    params.append("albumId", albumId);
  }

  do {
    const data = await fetchPage(params);
    items = items.concat(data.items.filter((item) => !!item));
    goToNextPage(params, data.nextPageToken);
  } while (params.has("pageToken"));

  return items;
}

function goToNextPage(params: URLSearchParams, nextPageToken: string) {
  if (nextPageToken) {
    params.set("pageToken", nextPageToken);
  } else {
    params.delete("pageToken");
  }
}

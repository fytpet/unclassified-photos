import { Album, AlbumsResponse, Photo, PhotosResponse, Session } from "../types/types";
import { ApiClient } from "./apiClient";

const ALBUM_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  static async getPhotos(session: Session) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
  
    do {
      const { data } = await ApiClient.get<PhotosResponse>(
        `/v1/mediaItems?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } },
        session.id
      );
  
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));

      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    return photos;
  }

  static async getAlbums(session: Session) {
    let albums: Album[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", ALBUM_PAGE_SIZE.toString());
  
    do {
      const { data } = await ApiClient.get<AlbumsResponse>(
        `/v1/albums?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } },
        session.id
      );
  
      albums = albums.concat(data.albums.filter((album: Album) => !!album));
  
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    return albums;
  }

  static async getPhotosOfAlbum(album: Album, session: Session) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
    params.append("albumId", album.id);

    do {
      const { data } = await ApiClient.post<PhotosResponse>(
        `/v1/mediaItems:search?${params.toString()}`,
        undefined,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } },
        session.id
      );
        
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
    
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));

    return photos;
  }
}

function goToNextPage(params: URLSearchParams, nextPageToken: string) {
  if (nextPageToken) {
    params.set("pageToken", nextPageToken);
  } else {
    params.delete("pageToken");
  }
}

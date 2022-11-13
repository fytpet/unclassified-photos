import { Album, AlbumsResponse, Photo, PhotosResponse, Session } from "../types/types";
import { Logger } from "../utils/Logger";
import { apiClient } from "./apiClient";

const ALBUM_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  static async getPhotos(session: Session) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
  
    Logger.verbose("Loading photos", session.id);
    do {
      const { data } = await apiClient.get<PhotosResponse>(
        `/v1/mediaItems?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } }
      );
  
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
      Logger.verbose(`Received ${photos.length} photos`, session.id);
  
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    Logger.info("Photos loaded", session.id);
    return photos;
  }

  static async getAlbums(session: Session) {
    let albums: Album[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", ALBUM_PAGE_SIZE.toString());
  
    Logger.verbose("Loading albums", session.id);
    do {
      const { data } = await apiClient.get<AlbumsResponse>(
        `/v1/albums?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } }
      );
  
      albums = albums.concat(data.albums.filter((album: Album) => !!album));
      Logger.verbose(`Received ${albums.length} albums`, session.id);
  
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    Logger.info("Albums loaded", session.id);
    return albums;
  }

  static async getPhotosOfAlbum(album: Album, session: Session) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
    params.append("albumId", album.id);

    Logger.verbose(`Loading photos for ${album.title}`, session.id);
    do {
      const { data } = await apiClient.post<PhotosResponse>(
        `/v1/mediaItems:search?${params.toString()}`,
        undefined,
        { headers: { "Authorization" : `Bearer ${session.bearer}` } }
      );
        
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
      Logger.verbose(`Received ${photos.length} photos for ${album.title}`, session.id);
    
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));

    Logger.info(`Photos for ${album.title} loaded`, session.id);
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

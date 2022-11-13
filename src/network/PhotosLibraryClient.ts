import { Album, AlbumsResponse, Photo, PhotosResponse } from "../types/types";
import { logger } from "../utils/logger";
import { apiClient } from "./apiClient";

const ALBUM_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  static async getPhotos(bearer: string) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
  
    logger.verbose("Loading photos");
    do {
      const { data } = await apiClient.get<PhotosResponse>(
        `/v1/mediaItems?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${bearer}` } }
      );
  
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
      logger.verbose(`Received ${photos.length} photos`);
  
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    logger.info("Photos loaded");
    return photos;
  }

  static async getAlbums(bearer: string) {
    let albums: Album[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", ALBUM_PAGE_SIZE.toString());
  
    logger.verbose("Loading albums");
    do {
      const { data } = await apiClient.get<AlbumsResponse>(
        `/v1/albums?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${bearer}` } }
      );
  
      albums = albums.concat(data.albums.filter((album: Album) => !!album));
      logger.verbose(`Received ${albums.length} albums`);
  
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    logger.info("Albums loaded");
    return albums;
  }

  static async getPhotosOfAlbum(album: Album, bearer: string) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
    params.append("albumId", album.id);

    logger.verbose(`Loading photos for ${album.title}`);
    do {
      const { data } = await apiClient.post<PhotosResponse>(
        `/v1/mediaItems:search?${params.toString()}`,
        undefined,
        { headers: { "Authorization" : `Bearer ${bearer}` } }
      );
        
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
      logger.verbose(`Received ${photos.length} photos for ${album.title}`);
    
      goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));

    logger.info(`Photos for ${album.title} loaded`);
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

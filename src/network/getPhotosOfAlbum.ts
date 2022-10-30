import { Album, Photo, PhotosResponse } from "../types/types";
import { logger } from "../utils/logger";
import { apiClient, goToNextPage } from "./apiClient";

const SEARCH_PAGE_SIZE = 100;

export async function getPhotosOfAlbum(album: Album) {
  let photos: Photo[] = [];

  const params = new URLSearchParams();
  params.append("pageSize", SEARCH_PAGE_SIZE.toString());
  params.append("albumId", album.id);

  logger.verbose(`Loading photos for ${album.title}`);
  do {
    const { data } = await apiClient.post<PhotosResponse>(`/v1/mediaItems:search?${params.toString()}`);

    photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
    logger.verbose(`Received ${photos.length} photos for ${album.title}`);
  
    goToNextPage(params, data.nextPageToken);
  } while (params.has("pageToken"));

  logger.info(`Photos for ${album.title} loaded`);
  return photos;
}

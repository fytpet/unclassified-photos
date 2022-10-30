import { Photo, PhotosResponse } from "../types/types";
import { logger } from "../utils/logger";
import { apiClient, goToNextPage } from "./apiClient";

const SEARCH_PAGE_SIZE = 100;

export async function getPhotos() {
  let photos: Photo[] = [];

  const params = new URLSearchParams();
  params.append("pageSize", SEARCH_PAGE_SIZE.toString());

  logger.verbose("Loading photos.");
  do {
    const { data } = await apiClient.get<PhotosResponse>(`/v1/mediaItems?${params.toString()}`);

    photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
    logger.verbose(`Received ${photos.length} photos`);

    goToNextPage(params, data.nextPageToken);
  } while (params.has("pageToken"));

  logger.info("Photos loaded.");
  return photos;
}

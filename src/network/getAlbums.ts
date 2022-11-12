import { Album, AlbumsResponse } from "../types/types";
import { logger } from "../utils/logger";
import { apiClient, goToNextPage } from "./apiClient";

const ALBUM_PAGE_SIZE = 50;

export async function getAlbums(accessToken: string) {
  let albums: Album[] = [];

  const params = new URLSearchParams();
  params.append("pageSize", ALBUM_PAGE_SIZE.toString());

  logger.verbose("Loading albums");
  do {
    const { data } = await apiClient.get<AlbumsResponse>(
      `/v1/albums?${params.toString()}`,
      { headers: { "Authorization" : `Bearer ${accessToken}` } }
    );

    albums = albums.concat(data.albums.filter((album: Album) => !!album));
    logger.verbose(`Received ${albums.length} albums`);

    goToNextPage(params, data.nextPageToken);
  } while (params.has("pageToken"));

  logger.info("Albums loaded");
  return albums;
}

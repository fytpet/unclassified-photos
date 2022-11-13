import axios, { AxiosError } from "axios";
import { AccessTokenError, AccessTokenResponse, Album, AlbumsResponse, Photo, PhotosResponse } from "../types/types";
import { logger } from "../utils/logger";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";
export const OAUTH_PROVIDER_BASE_URL = "https://accounts.google.com/o/oauth2";
export const REDIRECT_URI = `${process.env.BASE_URI}/oauth/redirect`;
const GRANT_TYPE = "authorization_code";
const ALBUM_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 100;

export class PhotosLibraryClient {
  private apiClient;

  constructor() {
    this.apiClient = axios.create({
      baseURL: PHOTOS_LIBRARY_BASE_URL,
      headers: {
        common: {
          "Content-Type": "application/json"
        }
      }
    });
    this.apiClient.interceptors.response.use(
      (config) => config,
      (err: AxiosError) => {
        const data = err.response?.data;
        logger.error(data);
        if ((data as AccessTokenError).error === "invalid_grant") {
          throw new Error("You have been signed out due to inactivity. Try signing in again.");
        }
        throw new Error("An unknown error occurred. Try again later.");
      }
    );
  }

  async createAccessToken(authCode: string) {
    logger.verbose("Requesting access token");

    const params = new URLSearchParams();
    params.append("client_id", process.env.GOOGLE_CLIENT_ID);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    params.append("code", authCode);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("grant_type", GRANT_TYPE);

    const { data: { access_token: accessToken } } = await this.apiClient.post<AccessTokenResponse>(
      "/token",
      params.toString(),
      { baseURL: OAUTH_PROVIDER_BASE_URL }
    );
  
    logger.verbose("Received access token");
    return accessToken;
  }

  async getPhotos(accessToken: string) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
  
    logger.verbose("Loading photos");
    do {
      const { data } = await this.apiClient.get<PhotosResponse>(
        `/v1/mediaItems?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${accessToken}` } }
      );
  
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
      logger.verbose(`Received ${photos.length} photos`);
  
      this.goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    logger.info("Photos loaded");
    return photos;
  }

  async getAlbums(accessToken: string) {
    let albums: Album[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", ALBUM_PAGE_SIZE.toString());
  
    logger.verbose("Loading albums");
    do {
      const { data } = await this.apiClient.get<AlbumsResponse>(
        `/v1/albums?${params.toString()}`,
        { headers: { "Authorization" : `Bearer ${accessToken}` } }
      );
  
      albums = albums.concat(data.albums.filter((album: Album) => !!album));
      logger.verbose(`Received ${albums.length} albums`);
  
      this.goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));
  
    logger.info("Albums loaded");
    return albums;
  }

  async getPhotosOfAlbum(album: Album, accessToken: string) {
    let photos: Photo[] = [];
  
    const params = new URLSearchParams();
    params.append("pageSize", SEARCH_PAGE_SIZE.toString());
    params.append("albumId", album.id);

    logger.verbose(`Loading photos for ${album.title}`);
    do {
      const { data } = await this.apiClient.post<PhotosResponse>(
        `/v1/mediaItems:search?${params.toString()}`,
        undefined,
        { headers: { "Authorization" : `Bearer ${accessToken}` } }
      );
        
      photos = photos.concat(data.mediaItems.filter((photo: Photo) => !!photo));
      logger.verbose(`Received ${photos.length} photos for ${album.title}`);
    
      this.goToNextPage(params, data.nextPageToken);
    } while (params.has("pageToken"));

    logger.info(`Photos for ${album.title} loaded`);
    return photos;
  }

  private goToNextPage(params: URLSearchParams, nextPageToken: string) {
    if (nextPageToken) {
      params.set("pageToken", nextPageToken);
    } else {
      params.delete("pageToken");
    }
  }
}

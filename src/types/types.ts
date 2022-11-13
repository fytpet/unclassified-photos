export interface AlbumsResponse {
  albums: Album[];
  nextPageToken: string;
}

export interface Album {
  id: string;
  title: string;
  productUrl: string;
  mediaItemsCount: string;
  coverPhotoBaseUrl: string;
  coverPhotoMediaItemId: string;
}

export interface PhotosResponse {
  mediaItems: Photo[];
  nextPageToken: string;
}

export interface Photo {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: MediaMetadata;
  filename: string;
}

interface MediaMetadata {
  creationTime: string;
  width: string;
  height: string;
}

export interface AccessTokenResponse {
  access_token: string;
}

export interface AccessTokenError {
  error: string;
  error_description: string;
}

export interface Session {
  id: string;
  bearer: string;
}
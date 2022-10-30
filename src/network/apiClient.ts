import axios, { AxiosError } from "axios";

const API_ENDPOINT = "https://photoslibrary.googleapis.com";

export const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    common: {
      "Content-Type": "application/json"
    }
  }
});

apiClient.interceptors.response.use(
  (config) => config,
  (error: AxiosError) => Promise.reject(error.response?.data)
);

export function setAccessToken(accessToken: string) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
}

export function goToNextPage(params: URLSearchParams, nextPageToken: string) {
  if (nextPageToken) {
    params.set("pageToken", nextPageToken);
  } else {
    params.delete("pageToken");
  }
}

import axios, { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_ENDPOINT = "https://photoslibrary.googleapis.com";

export const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    common: {
      "Authorization": `Bearer ${process.env.AUTH_TOKEN}`,
      "Content-Type": "application/json"
    }
  }
});

apiClient.interceptors.response.use((config) => {
  return config;
}, (error: AxiosError) => {
  return Promise.reject(error.response?.data);
});

export function goToNextPage(params: URLSearchParams, nextPageToken: string) {
  if (nextPageToken) {
    params.set("pageToken", nextPageToken);
  } else {
    params.delete("pageToken");
  }
}

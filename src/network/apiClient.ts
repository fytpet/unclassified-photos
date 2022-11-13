import axios, { AxiosError } from "axios";
import { AccessTokenError } from "../types/types";
import { logger } from "../utils/logger";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";

const apiClient = axios.create({
  baseURL: PHOTOS_LIBRARY_BASE_URL,
  headers: {
    common: {
      "Content-Type": "application/json"
    }
  }
});

apiClient.interceptors.response.use(
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

export { apiClient };

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { AccessTokenError } from "../types/types";
import { Logger } from "../utils/Logger";
import { withoutQuery } from "../utils/url";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";
const FALLBACK_VALUE = "UNKNOWN";

export class ApiClient {
  private static apiClient = axios.create({
    baseURL: PHOTOS_LIBRARY_BASE_URL,
    headers: {
      common: {
        "Content-Type": "application/json"
      }
    }
  });

  static async get<T>(url: string, config: AxiosRequestConfig, sessionId: string) {
    try {
      const result = await this.apiClient.get<T>(url, config);
      this.logResponse(url, sessionId, "GET", result.status);
      return result;
    } catch (err) {
      throw this.parseError(err, url, sessionId);
    }
  }

  static async post<T>(url: string, data: unknown, config: AxiosRequestConfig, sessionId: string) {
    try {
      const result = await this.apiClient.post<T>(url, data, config);
      this.logResponse(url, sessionId, "POST", result.status);
      return result;
    } catch (err) {
      throw this.parseError(err, url, sessionId);
    }
  }

  private static parseError(err: unknown, url: string, sessionId: string) {
    const { config, response } = err as AxiosError;
    const data = response?.data;

    this.logErrorResponse(url, sessionId, config?.method, response?.status);
    Logger.error(data, sessionId);
    
    if ((data as AccessTokenError).error === "invalid_grant") {
      return new Error("You have been signed out due to inactivity. Try signing in again.");
    }
    return new Error("An unknown error occurred. Try again later.");
  }

  private static logResponse(url: string, sessionId: string, method: string, status: number) {
    Logger.info(`[OUT] ${method} ${withoutQuery(url)} ${status}`, sessionId);
  }

  private static logErrorResponse(url: string, sessionId: string, method: string | undefined, status: number | undefined) {
    Logger.error(`[OUT] ${method?.toUpperCase() ?? FALLBACK_VALUE} ${withoutQuery(url)} ${status ?? FALLBACK_VALUE}`, sessionId);
  }
}

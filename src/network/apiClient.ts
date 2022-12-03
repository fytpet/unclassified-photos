import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { AccessTokenError, Session } from "../types/types";
import { Logger } from "../utils/Logger";
import { removeQueryStringFromUrl } from "../utils/url";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";
const FALLBACK_VALUE = "UNKNOWN";

export class ApiClient {
  private axios: AxiosInstance;
  private session: Session;

  constructor(session: Session) {
    this.axios = axios.create({
      baseURL: PHOTOS_LIBRARY_BASE_URL,
      headers: {
        common: {
          "Authorization" : session.bearer && `Bearer ${session.bearer}`,
          "Content-Type": "application/json"
        }
      }
    });
    this.session = session;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    try {
      const result = await this.axios.get<T>(url, config);
      this.logResponse(url, "GET", result.status);
      return result;
    } catch (err) {
      throw this.parseError(err, url);
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    try {
      const result = await this.axios.post<T>(url, data, config);
      this.logResponse(url, "POST", result.status);
      return result;
    } catch (err) {
      throw this.parseError(err, url);
    }
  }

  private parseError(err: unknown, url: string) {
    const { config, response } = err as AxiosError;
    const data = response?.data;

    this.logErrorResponse(url, config?.method, response?.status);
    Logger.error(data, this.session.id);
    
    if ((data as AccessTokenError).error === "invalid_grant") {
      return new Error("You have been signed out due to inactivity. Try signing in again.");
    }
    return new Error("An unknown error occurred. Try again later.");
  }

  private logResponse(url: string, method: string, status: number) {
    Logger.info(`[OUT] ${method} ${removeQueryStringFromUrl(url)} ${status}`, this.session.id);
  }

  private logErrorResponse(url: string, method: string | undefined, status: number | undefined) {
    Logger.error(`[OUT] ${method?.toUpperCase() ?? FALLBACK_VALUE} ${removeQueryStringFromUrl(url)} ${status ?? FALLBACK_VALUE}`, this.session.id);
  }
}

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
      },
    });
    this.axios.interceptors.response.use((res) => {
      Logger.info(this.toLog(res.config.url, res.config.method, res.status), session.id);
      return res;
    }, (err: AxiosError) => {
      throw this.parseError(err, err.config?.url);
    });
    this.session = session;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.axios.get<T>(url, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axios.post<T>(url, data, config);
  }

  private parseError(err: unknown, url: string | undefined) {
    const { config, response } = err as AxiosError;
    const data = response?.data;

    Logger.error(this.toLog(url, config?.method, response?.status), this.session.id);
    Logger.error(data, this.session.id);
    
    if ((data as AccessTokenError).error === "invalid_grant") {
      return new Error("Your session has expired. Try signing in again.");
    }
    return new Error("An unknown error occurred. Try again later.");
  }
  
  private toLog(url: string | undefined, method: string | undefined, status: number | undefined) {
    return `[OUT] ${method?.toUpperCase() ?? FALLBACK_VALUE} ${removeQueryStringFromUrl(url ?? FALLBACK_VALUE)} ${status ?? FALLBACK_VALUE}`;
  }
}

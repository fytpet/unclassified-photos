import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { Logger } from "../logging/Logger";
import { Session } from "../types/types";
import { URL } from "../network/utils";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";

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
      Logger.info(this.buildLogMessage(res.config.url, res.config.method, res.status), session.id);
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
    if (err instanceof AxiosError) {
      const { config, response } = err as AxiosError;
      const data = response?.data;

      Logger.error(this.buildLogMessage(url, config?.method, response?.status), this.session.id);
      Logger.error(data, this.session.id);

      if (data instanceof Object) {
        if ("error" in data && typeof data.error === "string") {
          if (data.error === "invalid_grant") {
            return new Error("Your session has expired. Try signing in again.");
          }
        }
      }
    }

    return new Error("An unknown error occurred. Try again later.");
  }
  
  private buildLogMessage(url: string | undefined, methodName: string | undefined, statusNumber: number | undefined) {
    const method = methodName?.toUpperCase() ?? "";
    const path = new URL(url).withoutQueryString();
    const status = statusNumber ?? "";
    return `[OUT] ${method} ${path} ${status}`;
  }
}

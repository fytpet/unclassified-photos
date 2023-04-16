import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { Logger } from "../../logging/Logger";
import { Session } from "../../types/types";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";

export class ApiClient {
  private readonly axios: AxiosInstance;
  private readonly session: Session;

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
      Logger.response(res, session.id);
      return res;
    }, (err: AxiosError) => {
      throw this.parseError(err, err.config?.url);
    });
    this.session = session;
  }

  async get<T>(url: string) {
    return this.axios.get<T>(url);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axios.post<T>(url, data, config);
  }

  private parseError(err: unknown, url: string | undefined): Error {
    if (err instanceof AxiosError) {
      const { config, response } = err as AxiosError;
      const data = response?.data;

      Logger.responseError(url, config?.method, response?.status, this.session.id);
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
}

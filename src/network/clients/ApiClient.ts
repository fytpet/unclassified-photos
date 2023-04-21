import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";
import { EXPIRED_SESSION_ERR_MSG, GENERIC_ERR_MSG } from "../../exceptions/errorMessages";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError";
import { Logger } from "../../logging/Logger";
import type { Session } from "../../types/types";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";

export class ApiClient {
  private readonly axios: AxiosInstance;

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
      Logger.httpResponse(res);
      return res;
    }, (err: AxiosError) => {
      throw this.parseError(err);
    });
  }

  async get<T>(url: string) {
    return this.axios.get<T>(url);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axios.post<T>(url, data, config);
  }

  private parseError(err: unknown): Error {
    if (err instanceof AxiosError) {
      const { response } = err as AxiosError;
      const data = response?.data;

      Logger.httpError(err);
      Logger.error(data);

      if (data instanceof Object) {
        if ("error" in data && typeof data.error === "string") {
          if (data.error === "invalid_grant") {
            return new UserFriendlyError(EXPIRED_SESSION_ERR_MSG);
          }
        }
      }
    }

    return new UserFriendlyError(GENERIC_ERR_MSG);
  }
}

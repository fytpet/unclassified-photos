import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";
import { EXPIRED_SESSION_ERR_MSG } from "../../exceptions/errorMessages.js";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError.js";
import { Logger } from "../../logging/Logger.js";

const PHOTOS_LIBRARY_BASE_URL = "https://photoslibrary.googleapis.com";

export class ApiClient {
  private readonly axios: AxiosInstance;

  constructor(accessToken?: string) {
    this.axios = axios.create({
      baseURL: PHOTOS_LIBRARY_BASE_URL,
      headers: {
        common: {
          "Authorization" : accessToken && `Bearer ${accessToken}`,
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

  private parseError(err: unknown) {
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

    return err;
  }
}

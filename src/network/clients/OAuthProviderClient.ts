import type { AccessTokenResponse, RefreshTokenResponse } from "../../types/types.js";
import { ApiClient } from "./ApiClient.js";

export const OAUTH_PROVIDER_BASE_URL = "https://accounts.google.com/o/oauth2";
export const REDIRECT_URI = `${process.env.BASE_URI}/oauth/redirect`;
const AUTH_CODE_GRANT_TYPE = "authorization_code";
const REFRESH_TOKEN_GRANT_TYPE = "refresh_token";

export class OAuthProviderClient {
  private readonly apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async createAccessToken(authCode: string) {
    const params = new URLSearchParams();
    params.append("client_id", process.env.GOOGLE_CLIENT_ID);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    params.append("code", authCode);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("grant_type", AUTH_CODE_GRANT_TYPE);

    const response = await this.apiClient.post<AccessTokenResponse>(
      "/token",
      params.toString(),
      { baseURL: OAUTH_PROVIDER_BASE_URL }
    );

    return {
      accessToken: response.data.access_token,
      expiresAtMs: Date.now() + response.data.expires_in * 1000,
      refreshToken: response.data.refresh_token,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const params = new URLSearchParams();
    params.append("client_id", process.env.GOOGLE_CLIENT_ID);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    params.append("refresh_token", refreshToken);
    params.append("grant_type", REFRESH_TOKEN_GRANT_TYPE);

    const response = await this.apiClient.post<RefreshTokenResponse>(
      "/token",
      params.toString(),
      { baseURL: OAUTH_PROVIDER_BASE_URL }
    );

    return {
      accessToken: response.data.access_token,
      expiresAtMs: Date.now() + response.data.expires_in * 1000,
    };
  }
}

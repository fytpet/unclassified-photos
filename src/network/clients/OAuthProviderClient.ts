import type { AccessTokenResponse } from "../../types/types";
import { ApiClient } from "./ApiClient";

export const OAUTH_PROVIDER_BASE_URL = "https://accounts.google.com/o/oauth2";
export const REDIRECT_URI = `${process.env.BASE_URI}/oauth/redirect`;
const GRANT_TYPE = "authorization_code";

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
    params.append("grant_type", GRANT_TYPE);

    const response = await this.apiClient.post<AccessTokenResponse>(
      "/token",
      params.toString(),
      { baseURL: OAUTH_PROVIDER_BASE_URL }
    );
  
    return response.data.access_token;
  }
}

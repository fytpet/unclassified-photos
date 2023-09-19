import type { Mock } from "vitest";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError.js";
import {
  SOME_ACCESS_TOKEN,
  SOME_ERROR_MESSAGE,
  SOME_OTHER_ACCESS_TOKEN,
  SOME_OTHER_TOKEN_EXPIRATION,
  SOME_REDIRECT_CODE,
  SOME_TOKEN_EXPIRATION
} from "./constants.js";

const SOME_REFRESH_TOKEN = "k1ns2n1s81ns";

const createAccessTokenStub = vi.fn((authCode: string) => {
  if (authCode !== SOME_REDIRECT_CODE) {
    return Promise.reject();
  }
  return Promise.resolve({
    accessToken: SOME_ACCESS_TOKEN,
    expiresAtMs: SOME_TOKEN_EXPIRATION,
    refreshToken: SOME_REFRESH_TOKEN,
  });
});

const refreshAccessTokenStub = vi.fn((refreshToken: string) => {
  if (refreshToken !== SOME_REFRESH_TOKEN) {
    return Promise.reject();
  }
  return Promise.resolve({
    accessToken: SOME_OTHER_ACCESS_TOKEN,
    expiresAtMs: SOME_OTHER_TOKEN_EXPIRATION,
  });
});

vi.mock("../../network/clients/OAuthProviderClient", async (actual): Promise<{ OAuthProviderClient: Mock }> => ({
  ...await actual(),
  OAuthProviderClient: vi.fn(() => ({
    createAccessToken: createAccessTokenStub,
    refreshAccessToken: refreshAccessTokenStub
  }))
}));

export function givenAccessTokenCreationFailure() {
  beforeEach(() => {
    createAccessTokenStub.mockImplementationOnce(
      () => Promise.reject(new UserFriendlyError(SOME_ERROR_MESSAGE))
    );
  });
}

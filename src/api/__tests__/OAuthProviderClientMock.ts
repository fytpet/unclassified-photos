/* eslint-disable @typescript-eslint/no-unsafe-return */
export const SOME_REDIRECT_CODE = "j2nsfd91h1";
export const SOME_ACCESS_TOKEN = "91md71h2bs8aa22f";
export const createAccessTokenMock = jest.fn();

jest.mock("../../network/clients/OAuthProviderClient", () => ({
  ...jest.requireActual("../../network/clients/OAuthProviderClient"),
  OAuthProviderClient: jest.fn().mockImplementation(() => ({
    createAccessToken: createAccessTokenMock
  }))
}));

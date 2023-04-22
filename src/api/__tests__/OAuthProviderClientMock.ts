export const SOME_REDIRECT_CODE = "j2nsfd91h1";
export const SOME_ACCESS_TOKEN = "91md71h2bs8aa22f";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const OAuthProviderClientMock = ({
  ...jest.requireActual("../../network/clients/OAuthProviderClient"),
  OAuthProviderClient: jest.fn().mockImplementation(() => ({
    createAccessToken: async (code: string) =>
      Promise.resolve(code === SOME_REDIRECT_CODE ? SOME_ACCESS_TOKEN : undefined)
  }))
});

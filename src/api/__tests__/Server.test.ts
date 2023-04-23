jest.mock("../../logging/Logger");

import { createAccessTokenMock, SOME_ACCESS_TOKEN, SOME_REDIRECT_CODE } from "./OAuthProviderClientMock";
import type { AxiosResponse } from "axios";
import { Server } from "../Server";
import axios from "axios";
import {
  AUTHENTICATION_ERR_MSG, signInErrMsg, EXPIRED_SESSION_ERR_MSG, GENERIC_ERR_MSG
} from "../../exceptions/errorMessages";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError";

const SIGN_IN_PAGE = "You first need to sign in with Google";
const HOME_PAGE = "<span>Search</span>";
const SOME_ERROR_MESSAGE = "Oops! Something went wrong!";
const SOME_REDIRECT_ERROR = "redirection_failed";

const HOME_ROUTE = "http://localhost:3000";
const SIGN_IN_ROUTE = `${HOME_ROUTE}/sign-in`;
const SIGN_OUT_ROUTE = `${HOME_ROUTE}/sign-out`;
const OAUTH_ROUTE = `${HOME_ROUTE}/oauth`;
const REDIRECT_ROUTE_WITH_ERROR = `${HOME_ROUTE}/oauth/redirect?error=${SOME_REDIRECT_ERROR}`;
const REDIRECT_ROUTE_WITHOUT_CODE = `${HOME_ROUTE}/oauth/redirect`;
const REDIRECT_ROUTE_WITH_CODE = `${HOME_ROUTE}/oauth/redirect?code=${SOME_REDIRECT_CODE}`;
const UNKNOWN_ROUTE = `${HOME_ROUTE}/unknown`;

let server: Server;
let response: AxiosResponse;
const destroySession = jest.fn();
const regenerateSession = jest.fn();
let redirect: jest.SpyInstance = jest.fn();

function givenUnauthenticatedSession() {
  beforeEach(async () => {
    await givenSession();
  });
}

function givenAuthenticatedSession() {
  beforeEach(async () => {
    await givenSession();
    response = await axios.get(REDIRECT_ROUTE_WITH_CODE);
  });
}

async function givenSession() {
  createAccessTokenMock.mockImplementation(
    (code: string) => Promise.resolve(code === SOME_REDIRECT_CODE ? SOME_ACCESS_TOKEN : undefined)
  );

  server = new Server((req, res, next) => {
    req.session.destroy = destroySession.mockImplementation((callback: () => void) => callback());
    req.session.regenerate = regenerateSession.mockImplementation((callback: () => void) => callback());
    redirect = jest.spyOn(res, "redirect");
    next();
  });
  server.start();

  const response = await axios.get(HOME_ROUTE);
  axios.defaults.headers["Cookie"] = response.headers["set-cookie"] ?? "";
}

function whenNavigatingTo(route: string) {
  beforeEach(async () => {
    response = await axios.get(route);
  });
}

function whenSubmittingTo(route: string) {
  beforeEach(async () => {
    response = await axios.post(route);
  });
}

function thenRenders(expected: string) {
  expect(response.data).toContain(expected);
}

afterEach(() => {
  delete axios.defaults.headers["Cookie"];
  jest.clearAllMocks();
  server.close();
});

describe("given unauthenticated session", () => {
  givenUnauthenticatedSession();

  describe("when navigating to sign-in route", () => {
    whenNavigatingTo(SIGN_IN_ROUTE);

    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
  });

  describe("when navigating to home route", () => {
    whenNavigatingTo(HOME_ROUTE);
  
    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
  });

  describe("when submitting to home route", () => {
    whenSubmittingTo(HOME_ROUTE);

    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
    test("then renders expired session error message", () => thenRenders(EXPIRED_SESSION_ERR_MSG));
  });

  describe("when navigating to unknown route", () => {
    whenNavigatingTo(UNKNOWN_ROUTE);

    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
  });
});

describe("given authenticated session", () => {
  givenAuthenticatedSession();

  describe("when navigating to sign-in route", () => {
    whenNavigatingTo(SIGN_IN_ROUTE);

    test("then renders home page", () => thenRenders(HOME_PAGE));
  });

  describe("when navigating to home route", () => {
    whenNavigatingTo(HOME_ROUTE);

    test("then renders home page", () => thenRenders(HOME_PAGE));
  });

  describe("when navigating to unknown route", () => {
    whenNavigatingTo(UNKNOWN_ROUTE);

    test("then renders home page", () => thenRenders(HOME_PAGE));
  });
});

describe("given session", () => {
  givenUnauthenticatedSession();

  describe("when navigating to sign-out route", () => {
    whenNavigatingTo(SIGN_OUT_ROUTE);

    test("then session is destroyed", () => expect(destroySession).toHaveBeenCalledTimes(1));
    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
  });

  describe("when navigating to oauth route", () => {
    whenNavigatingTo(OAUTH_ROUTE);
  
    test("then user is redirected to oauth provider", () => 
      expect(redirect).toHaveBeenCalledWith(expectedOAuthProviderUrl())
    );
  });

  describe("when navigating to redirect route with error", () => {
    whenNavigatingTo(REDIRECT_ROUTE_WITH_ERROR);

    test("then session is regenerated", () => expect(regenerateSession).toHaveBeenCalledTimes(1));
    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
    test("then renders sign-in redirect error message", () => thenRenders(signInErrMsg(SOME_REDIRECT_ERROR)));
  });

  describe("when navigating to redirect route without code", () => {
    whenNavigatingTo(REDIRECT_ROUTE_WITHOUT_CODE);

    test("then session is regenerated", () => expect(regenerateSession).toHaveBeenCalledTimes(1));
    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
    test("then renders authentication error message", () => thenRenders(AUTHENTICATION_ERR_MSG));
  });

  describe("when navigating to redirect route with code", () => {
    whenNavigatingTo(REDIRECT_ROUTE_WITH_CODE);

    test("then session is regenerated", () => expect(regenerateSession).toHaveBeenCalledTimes(1));
    test("then renders home page", () => thenRenders(HOME_PAGE));
  });

  describe("when access token creation fails", () => {
    beforeEach(async () => {
      createAccessTokenMock.mockImplementation(() => Promise.reject(SOME_ERROR_MESSAGE));
      response = await axios.get(REDIRECT_ROUTE_WITH_CODE);
    });

    test("then session is regenerated", () => expect(regenerateSession).toHaveBeenCalledTimes(1));
    test("then renders sign-in page", () => thenRenders(SIGN_IN_PAGE));
    test("then renders generic error message", () => thenRenders(GENERIC_ERR_MSG));
  });

  describe("when access token creation fails with user-friendly message", () => {
    beforeEach(async () => {
      createAccessTokenMock.mockImplementation(() => Promise.reject(new UserFriendlyError(SOME_ERROR_MESSAGE)));
      response = await axios.get(REDIRECT_ROUTE_WITH_CODE);
    });

    test("then renders error message", () => thenRenders(SOME_ERROR_MESSAGE));
  });
});

function expectedOAuthProviderUrl() {
  const params = new URLSearchParams();
  params.append("client_id", "some.google.client.id");
  params.append("redirect_uri", "http://localhost:3000/oauth/redirect");
  params.append("response_type", "code");
  params.append("scope", "https://www.googleapis.com/auth/photoslibrary.readonly");
  params.append("prompt", "select_account");
  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}

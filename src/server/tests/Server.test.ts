jest.mock("../../logging/Logger.ts");
import axios, { AxiosResponse } from "axios";
import { RequestHandler } from "express";
import { UnclassifiedPhotosServer } from "../Server";

const HOME_ROUTE = process.env.BASE_URI;
const SIGN_IN_ROUTE = `${HOME_ROUTE}/sign-in`;
const SIGN_OUT_ROUTE = `${HOME_ROUTE}/sign-out`;
const OAUTH_ROUTE = `${HOME_ROUTE}/oauth`;
const UNKNOWN_ROUTE = `${HOME_ROUTE}/unknown`;

const SOME_ERROR_MESSAGE = "Something went wrong! Try again.";

let server: UnclassifiedPhotosServer;
let response: AxiosResponse;
const destroySession = jest.fn();
let redirect: jest.SpyInstance;

function givenUnauthenticated() {
  startServer((req, _, next) => {
    req.session.error = SOME_ERROR_MESSAGE;
    next();
  });
}

function givenAuthenticated() {
  startServer((req, _, next) => {
    req.session.bearer = "somesessionbearer";
    next();
  });
}

function givenServer() {
  startServer((req, res, next) => {
    req.destroy = destroySession;
    redirect = jest.spyOn(res, "redirect");
    next();
  });
}

function whenNavigatingTo(route: string) {
  beforeEach(async () => {
    response = await axios.get(route);
  });
}

function thenSignInPageIsRendered() {
  expect(response.data).toContain("You first need to sign in with Google");
}

function thenHomePageIsRendered() {
  expect(response.data).toContain("<span>Search</span>");
}

function thenErrorMessageIsRendered() {
  expect(response.data).toContain(SOME_ERROR_MESSAGE);
}

describe("given unauthenticated", () => {
  givenUnauthenticated();

  describe("when navigating to sign-in route", () => {
    whenNavigatingTo(SIGN_IN_ROUTE);

    test("then sign-in page is rendered", () => {
      thenSignInPageIsRendered();
    });
  });

  describe("when navigating to home route", () => {
    whenNavigatingTo(HOME_ROUTE);
  
    test("then sign-in page is rendered", () => {
      thenSignInPageIsRendered();
    });

    test("then error message is rendered", () => {
      thenErrorMessageIsRendered();
    });
  });
});

describe("given authenticated", () => {
  givenAuthenticated();

  describe("when navigating to sign-in route", () => {
    whenNavigatingTo(SIGN_IN_ROUTE);

    test("then home page is rendered", () => {
      thenHomePageIsRendered();
    });
  });

  describe("when navigating to home route", () => {
    whenNavigatingTo(HOME_ROUTE);

    test("then home page is rendered", () => {
      thenHomePageIsRendered();
    });
  });
});

describe("given server", () => {
  givenServer();

  describe("when navigating to sign-out route", () => {
    whenNavigatingTo(SIGN_OUT_ROUTE);

    test("then session is destroyed", () => {
      expect(destroySession).toHaveBeenCalled();
    });

    test("then sign-in page is rendered", () => {
      thenSignInPageIsRendered();
    });
  });

  describe("when navigating to oauth route", () => {
    whenNavigatingTo(OAUTH_ROUTE);
  
    test("then user is redirected to oauth provider", () => {
      expect(redirect).toHaveBeenCalledWith(expectedOAuthProviderUrl());
    });
  });

  describe("when navigating to unknown route", () => {
    whenNavigatingTo(UNKNOWN_ROUTE);
    
    test("then sign-in page is rendered", () => {
      thenSignInPageIsRendered();
    });
  });
});

afterEach(() => {
  server.close();
});

function startServer(handler: RequestHandler) {
  beforeEach(() => {
    server = new UnclassifiedPhotosServer(handler);
    server.start();
  });
}

function expectedOAuthProviderUrl() {
  const params = new URLSearchParams();
  params.append("client_id", "somegoogleclientid");
  params.append("redirect_uri", "http://localhost:8080/oauth/redirect");
  params.append("response_type", "code");
  params.append("scope", "https://www.googleapis.com/auth/photoslibrary.readonly");
  params.append("prompt", "select_account");
  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}

jest.mock("../../logging/Logger.ts");
import type { AxiosResponse } from "axios";
import type { RequestHandler } from "express";
import { Server } from "../Server";
import axios from "axios";

const SIGN_IN_PAGE = "You first need to sign in with Google";
const HOME_PAGE = "<span>Search</span>";
const ERROR_MESSAGE = "Something went wrong! Try again.";
const REDIRECT_ERROR = "redirection_failed";

const HOME_ROUTE = process.env.BASE_URI;
const SIGN_IN_ROUTE = `${HOME_ROUTE}/sign-in`;
const SIGN_OUT_ROUTE = `${HOME_ROUTE}/sign-out`;
const OAUTH_ROUTE = `${HOME_ROUTE}/oauth`;
const REDIRECT_ROUTE_WITH_ERROR = `${HOME_ROUTE}/oauth/redirect?error=${REDIRECT_ERROR}`;
const UNKNOWN_ROUTE = `${HOME_ROUTE}/unknown`;

let server: Server;
let response: AxiosResponse;
const destroySession = jest.fn();
const regenerateSession = jest.fn();
let redirect: jest.SpyInstance = jest.fn();

function givenUnauthenticated() {
  startServer((req, _, next) => {
    req.session.error = ERROR_MESSAGE;
    next();
  });
}

function givenAuthenticated() {
  startServer((req, _, next) => {
    req.session.bearer = "somesessionbearer";
    req.session.save(() => next());
  }, HOME_ROUTE);
}

function givenServer() {
  startServer((req, res, next) => {
    req.session.destroy = destroySession.mockImplementation((callback: () => void) => callback());
    req.session.regenerate = regenerateSession.mockImplementation((callback: () => void) => callback());
    redirect = jest.spyOn(res, "redirect");
    next();
  });
}

function whenNavigatingTo(route: string) {
  beforeEach(async () => {
    response = await axios.get(route);
  });
}

function thenRenders(expected: string) {
  expect(response.data).toContain(expected);
}

describe("given unauthenticated", () => {
  givenUnauthenticated();

  describe("when navigating to sign-in route", () => {
    whenNavigatingTo(SIGN_IN_ROUTE);

    test("then renders sign-in page", () => {
      thenRenders(SIGN_IN_PAGE);
    });
  });

  describe("when navigating to home route", () => {
    whenNavigatingTo(HOME_ROUTE);
  
    test("then renders sign-in page", () => {
      thenRenders(SIGN_IN_PAGE);
    });

    test("then renders error message", () => {
      thenRenders(ERROR_MESSAGE);
    });
  });
});

describe("given authenticated", () => {
  givenAuthenticated();

  describe("when navigating to sign-in route", () => {
    whenNavigatingTo(SIGN_IN_ROUTE);

    test("then renders home page", () => {
      thenRenders(HOME_PAGE);
    });
  });

  describe("when navigating to home route", () => {
    whenNavigatingTo(HOME_ROUTE);

    test("then renders home page", () => {
      thenRenders(HOME_PAGE);
    });
  });
});

describe("given server", () => {
  givenServer();

  describe("when navigating to sign-out route", () => {
    whenNavigatingTo(SIGN_OUT_ROUTE);

    test("then session is destroyed", () => {
      expect(destroySession).toHaveBeenCalledTimes(1);
    });

    test("then renders sign-in page", () => {
      thenRenders(SIGN_IN_PAGE);
    });
  });

  describe("when navigating to oauth route", () => {
    whenNavigatingTo(OAUTH_ROUTE);
  
    test("then user is redirected to oauth provider", () => {
      expect(redirect).toHaveBeenCalledWith(expectedOAuthProviderUrl());
    });
  });

  describe("when navigating to redirect route with error", () => {
    whenNavigatingTo(REDIRECT_ROUTE_WITH_ERROR);

    test("then session is destroyed", () => {
      expect(regenerateSession).toHaveBeenCalledTimes(1);
    });

    test("then renders sign-in page", () => {
      thenRenders(SIGN_IN_PAGE);
    });

    test("then renders redirect error", () => {
      thenRenders(REDIRECT_ERROR);
    });
  });

  describe("when navigating to unknown route", () => {
    whenNavigatingTo(UNKNOWN_ROUTE);
    
    test("then renders sign-in page", () => {
      thenRenders(SIGN_IN_PAGE);
    });
  });
});

function startServer(handler: RequestHandler, startingRoute = SIGN_IN_ROUTE) {
  beforeEach(async () => {
    server = new Server(handler);
    server.start();

    const response = await axios.get(startingRoute);
    axios.defaults.headers["Cookie"] = response.headers["set-cookie"] ?? "";
  });

  afterEach(() => {
    delete axios.defaults.headers["Cookie"];
    destroySession.mockClear();
    regenerateSession.mockClear();
    redirect.mockClear();
    server.close();
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

// jest.mock("../../logging/Logger.ts");
import axios, { AxiosResponse } from "axios";
import { RequestHandler } from "express";
import { UnclassifiedPhotosServer } from "../Server";

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

let server: UnclassifiedPhotosServer;
let response: AxiosResponse;
const destroySession = jest.fn();
let redirect: jest.SpyInstance;

function givenUnauthenticated() {
  startServer((req, _, next) => {
    req.session.error = ERROR_MESSAGE;
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
    req.session.destroy = destroySession;
    redirect = jest.spyOn(res, "redirect");
    next();
  });
}

function whenNavigatingTo(route: string) {
  beforeEach(async () => {
    response = await axios.get(route);
  });
}

function thenRenders(error: string) {
  expect(response.data).toContain(error);
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
      expect(destroySession).toHaveBeenCalled();
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

afterEach(() => {
  server.close();
});

function startServer(handler: RequestHandler) {
  beforeEach(async () => {
    server = new UnclassifiedPhotosServer(handler);
    server.start();

    const response = await axios.get(SIGN_IN_ROUTE);
    axios.defaults.headers["Cookie"] = response.headers["set-cookie"] ?? "";
  });

  afterEach(() => {
    delete axios.defaults.headers["Cookie"];
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

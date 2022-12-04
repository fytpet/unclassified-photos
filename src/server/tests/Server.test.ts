jest.mock("../../logging/Logger.ts");
import axios, { AxiosResponse } from "axios";
import { RequestHandler } from "express";
import { UnclassifiedPhotosServer } from "../Server";

const BASE_URI = process.env.BASE_URI;
const SOME_SESSION_BEARER = "somesessionbearer";
const SOME_ERROR_MESSAGE = "Something went wrong! Try again.";

let server: UnclassifiedPhotosServer | undefined;
let response: AxiosResponse;

function givenUnauthenticated() {
  beforeEach(() => {
    givenServer((req, _, next) => {
      req.session.error = SOME_ERROR_MESSAGE;
      next();
    });
  });
}

function givenAuthenticated() {
  beforeEach(() => {
    givenServer((req, _, next) => {
      req.session.bearer = SOME_SESSION_BEARER;
      next();
    });
  });
}

function givenServer(middleware?: RequestHandler) {
  server = new UnclassifiedPhotosServer(middleware);
  server.start();
}

function whenNavigatingToSignIn() {
  beforeEach(async () => {
    response = await axios.get(`${BASE_URI}/sign-in`);
  });
}

function whenNavigatingToHome() {
  beforeEach(async () => {
    response = await axios.get(BASE_URI);
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

afterEach(() => {
  if (server) {
    server.close();
  }
});

describe("given unauthenticated", () => {
  givenUnauthenticated();

  describe("when navigating to sign-in", () => {
    whenNavigatingToSignIn();

    test("then sign-in page is rendered", () => {
      thenSignInPageIsRendered();
    });
  });

  describe("when navigating to home", () => {
    whenNavigatingToHome();
  
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

  describe("when navigating to sign-in", () => {
    whenNavigatingToSignIn();

    test("then home page is rendered", () => {
      thenHomePageIsRendered();
    });
  });

  describe("when navigating to home", () => {
    whenNavigatingToHome();

    test("then home page is rendered", () => {
      thenHomePageIsRendered();
    });
  });
});

describe("given server", () => {
  describe("when navigating to sign-out", () => {
    test("then session is destroyed", async () => {
      const destroy = jest.fn();
      givenServer((req, _, next) => {
        req.session.destroy = destroy;
        next();
      });

      await axios.get(`${BASE_URI}/sign-out`);

      expect(destroy).toHaveBeenCalled();
    });

    test("then sign-in page is rendered", async () => {
      givenServer();

      response = await axios.get(`${BASE_URI}/sign-out`);

      thenSignInPageIsRendered();
    });
  });

  describe("when navigating to oauth", () => {
    test("then user is redirected to oauth provider", async () => {
      let redirect;
      givenServer((_, res, next) => {
        redirect = jest.fn(() => {
          res.sendStatus(200);
        });
        res.redirect = redirect;
        next();
      });

      await axios.get(`${BASE_URI}/oauth`);

      expect(redirect).toHaveBeenCalledWith(expectedUri());
    });

    function expectedUri() {
      const params = new URLSearchParams();
      params.append("client_id", "somegoogleclientid");
      params.append("redirect_uri", "http://localhost:8080/oauth/redirect");
      params.append("response_type", "code");
      params.append("scope", "https://www.googleapis.com/auth/photoslibrary.readonly");
      params.append("prompt", "select_account");
      return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
    }
  });

  describe("when navigating to unknown route", () => {
    test("then sign-in page is rendered", async () => {
      givenServer();

      response = await axios.get(`${BASE_URI}/unknown`);

      thenSignInPageIsRendered();
    });
  });
});

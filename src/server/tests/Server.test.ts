jest.mock("../../logging/Logger.ts");
import axios from "axios";
import { RequestHandler } from "express";
import { UnclassifiedPhotosServer } from "../Server";

const BASE_URI = process.env.BASE_URI;
const SOME_SESSION_BEARER = "somesessionbearer";
const SOME_ERROR_MESSAGE = "Something went wrong! Try again.";
const SIGN_IN_PAGE_TEXT = "You first need to sign in with Google";
const HOME_PAGE_TEXT = "<span>Search</span>";

let server: UnclassifiedPhotosServer | undefined;

function givenUnauthenticated(errorMessage?: string) {
  givenServer((req, _, next) => {
    if (errorMessage) {
      req.session.error = errorMessage;
    }
    next();
  });
}

function givenAuthenticated() {
  givenServer((req, _, next) => {
    req.session.bearer = SOME_SESSION_BEARER;
    next();
  });
}

function givenServer(middleware?: RequestHandler) {
  server = new UnclassifiedPhotosServer(middleware);
  server.start();
}

afterEach(() => {
  if (server) {
    server.close();
  }
});

describe("given unauthenticated", () => {
  describe("when navigating to sign-in", () => {
    test("then sign-in page is rendered", async () => {
      givenUnauthenticated();

      const response = await axios.get(`${BASE_URI}/sign-in`);

      expect(response.data).toContain(SIGN_IN_PAGE_TEXT);
    });
  });

  describe("when navigating to home", () => {
    test("then sign-in page is rendered", async () => {
      givenUnauthenticated();

      const response = await axios.get(BASE_URI);

      expect(response.data).toContain(SIGN_IN_PAGE_TEXT);
    });

    test("then error message is rendered", async () => {
      givenUnauthenticated(SOME_ERROR_MESSAGE);

      const response = await axios.get(BASE_URI);

      expect(response.data).toContain(SOME_ERROR_MESSAGE);
    });
  });
});

describe("given authenticated", () => {
  describe("when navigating to sign-in", () => {
    test("then home page is rendered", async () => {
      givenAuthenticated();

      const response = await axios.get(BASE_URI);

      expect(response.data).toContain(HOME_PAGE_TEXT);
    });
  });

  describe("when navigating to home", () => {
    test("then home page is rendered", async () => {
      givenAuthenticated();

      const response = await axios.get(BASE_URI);

      expect(response.data).toContain(HOME_PAGE_TEXT);
    });
  });

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

      const response = await axios.get(`${BASE_URI}/sign-out`);

      expect(response.data).toContain(SIGN_IN_PAGE_TEXT);
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

      const response = await axios.get(`${BASE_URI}/unknown`);

      expect(response.data).toContain(SIGN_IN_PAGE_TEXT);
    });
  });
});

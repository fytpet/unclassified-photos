import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import open from "open";
import { AccessTokenResponse } from "../types/types";
import { logger } from "../utils/logger";
import { setAccessToken } from "./apiClient";

dotenv.config();

const REDIRECT_PORT = 3000;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth`;
const BASE_OAUTH_PROVIDER_URI = "https://accounts.google.com/o/oauth2";
const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";
const RESPONSE_TYPE = "code";
const GRANT_TYPE = "authorization_code";

export async function authenticate() {
  logger.info("Starting authentication process");

  let resolveCode: (value: string) => void = () => undefined;
  const promisedCode = new Promise<string>((_resolve) => {
    resolveCode = _resolve;
  });

  logger.verbose(`Listening on port ${REDIRECT_PORT} for auth code`);
  const server = createServer(resolveCode);

  logger.verbose("Redirecting user to OAuth provider");
  await open(`${BASE_OAUTH_PROVIDER_URI}/auth?${authCodeParams()}`);

  logger.verbose("Received auth code");
  const code = await promisedCode;

  logger.verbose("Closing server");
  server.close();

  logger.verbose("Requesting access token");
  const { data: { access_token } } = await axios.post<AccessTokenResponse>(
    `${BASE_OAUTH_PROVIDER_URI}/token`,
    accessTokenParams(code)
  );

  logger.verbose("Received access token");
  setAccessToken(access_token);

  logger.info("Authentication process finished successfully");
}

function createServer(resolveCode: (value: string) => void) {
  const app = express();

  app.get("/oauth", function (req, res) {
    const { code, error } = req.query;
    if (typeof (error) === "string") {
      throw new Error(error);
    }
    if (typeof (code) !== "string") {
      throw new Error("Could not parse auth code");
    }
    resolveCode(code);
    res.end("Authentication successful, you may now close this page");
  });

  return app.listen(REDIRECT_PORT);
}

function authCodeParams() {
  const params = new URLSearchParams();
  params.append("client_id", process.env.CLIENT_ID);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("response_type", RESPONSE_TYPE);
  params.append("scope", PHOTOS_LIBRARY_READONLY_SCOPE);
  return params.toString();
}

function accessTokenParams(code: string) {
  const params = new URLSearchParams();
  params.append("client_id", process.env.CLIENT_ID);
  params.append("client_secret", process.env.CLIENT_SECRET);
  params.append("code", code);
  params.append("grant_type", GRANT_TYPE);
  params.append("redirect_uri", REDIRECT_URI);
  return params.toString();
}

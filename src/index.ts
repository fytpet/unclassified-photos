import dotenv from "dotenv";
import express, { Request } from "express";
import { apiClient } from "./network/apiClient";
import { AccessTokenResponse } from "./types/types";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger";
import { findUnclassifiedPhotos } from "./findUnclassifiedPhotos";

dotenv.config();

const PORT = 8080;
const BASE_URI = `http://localhost:${PORT}`;
const REDIRECT_URI = `${BASE_URI}/oauth/redirect`;
const BASE_OAUTH_PROVIDER_URI = "https://accounts.google.com/o/oauth2";
const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";
const RESPONSE_TYPE = "code";
const GRANT_TYPE = "authorization_code";

const app = express();

app.use(cookieParser());
app.use(express.static("./src/public"));

app.get("/", (_, res) => {
  res.redirect(`${BASE_URI}/home.html`);
});

app.get("/oauth", (_, res) => {
  res.redirect(`${BASE_OAUTH_PROVIDER_URI}/auth?${authCodeParams()}`);
});

app.get("/oauth/redirect", (req, res) => {
  const { code, error } = req.query;
  if (typeof (error) === "string") {
    throw new Error(error);
  }
  if (typeof (code) !== "string") {
    throw new Error("Could not parse auth code");
  }
  res.cookie("auth_code", code);
  res.redirect(`${BASE_URI}/home.html`);
});

app.get("/unclassified-photos", (req: Request, res) => {
  const getUnclassifiedPhotos = async () => {
    const { auth_code } = req.cookies as { auth_code?: string };

    if (!auth_code) {
      res.sendStatus(401);
      return;
    }

    logger.verbose("Requesting access token");
    const { data: { access_token: accessToken } } = await apiClient.post<AccessTokenResponse>(
      "/token",
      accessTokenParams(auth_code),
      { baseURL: BASE_OAUTH_PROVIDER_URI }
    );
    logger.verbose("Received access token");

    const unclassifiedPhotos = await findUnclassifiedPhotos(accessToken);
    res.send(unclassifiedPhotos);
  };

  getUnclassifiedPhotos().catch((e) => {
    logger.error(e);
    res.clearCookie("auth_code");
    res.redirect(`${BASE_URI}/home.html`);
  });
});

logger.info(`Server listening on ${PORT}`);
app.listen(PORT);

function authCodeParams() {
  const params = new URLSearchParams();
  params.append("client_id", process.env.GOOGLE_CLIENT_ID);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("response_type", RESPONSE_TYPE);
  params.append("scope", PHOTOS_LIBRARY_READONLY_SCOPE);
  return params.toString();
}

function accessTokenParams(code: string) {
  const params = new URLSearchParams();
  params.append("client_id", process.env.GOOGLE_CLIENT_ID);
  params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
  params.append("code", code);
  params.append("grant_type", GRANT_TYPE);
  params.append("redirect_uri", REDIRECT_URI);
  return params.toString();
}

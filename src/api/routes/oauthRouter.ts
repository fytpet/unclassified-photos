import express from "express";
import { AUTHENTICATION_ERR_MSG, signInErrMsg } from "../../exceptions/errorMessages.js";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError.js";
import { Logger } from "../../logging/Logger.js";
import {
  OAuthProviderClient,
  OAUTH_PROVIDER_BASE_URL, REDIRECT_URI
} from "../../network/clients/OAuthProviderClient.js";

const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";

export const oauthRouter = express.Router();

oauthRouter.get("/", (_, res) => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.GOOGLE_CLIENT_ID);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("response_type", "code");
  params.append("scope", PHOTOS_LIBRARY_READONLY_SCOPE);
  params.append("access_type", "offline");
  params.append("prompt", "consent select_account");

  res.redirect(`${OAUTH_PROVIDER_BASE_URL}/auth?${params.toString()}`);
});

oauthRouter.get("/redirect", (req, res, next) => {
  const { code, error } = req.query;
  if (typeof(error) === "string") {
    throw new UserFriendlyError(signInErrMsg(error));
  }
  if (typeof(code) !== "string") {
    throw new UserFriendlyError(AUTHENTICATION_ERR_MSG);
  }

  new OAuthProviderClient()
    .createAccessToken(code)
    .then(({ accessToken, expiresAtMs, refreshToken }) => {
      req.session.regenerate((err) => {
        if (err) Logger.error(err);
        req.session.accessToken = accessToken;
        req.session.expiresAtMs = expiresAtMs;
        req.session.refreshToken = refreshToken;
        res.redirect("/");
      });
    })
    .catch((err) => next(err));
});

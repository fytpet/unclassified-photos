import express from "express";
import { OAuthProviderClient, OAUTH_PROVIDER_BASE_URL, REDIRECT_URI } from "../../network/clients/OAuthProviderClient";
const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";

export const oauthRouter = express.Router();

oauthRouter.get("/", (_, res) => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.GOOGLE_CLIENT_ID);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("response_type", "code");
  params.append("scope", PHOTOS_LIBRARY_READONLY_SCOPE);
  params.append("prompt", "select_account");

  res.redirect(`${OAUTH_PROVIDER_BASE_URL}/auth?${params.toString()}`);
});

oauthRouter.get("/redirect", (req, res, next) => {
  const { code, error } = req.query;
  if (typeof(error) === "string") {
    throw new Error(`Could not sign you in: ${error}`);
  }
  if (typeof(code) !== "string") {
    throw new Error("Could not sign you in: authentication failed");
  }

  const oauthProviderClient = new OAuthProviderClient({ id: req.sessionID });
  oauthProviderClient.createAccessToken(code)
    .then((accessToken) => {
      req.session.bearer = accessToken;
      res.redirect("/");
    })
    .catch((err) => next(err));
});

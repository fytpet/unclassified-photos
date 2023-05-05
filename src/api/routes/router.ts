import type { Request } from "express";
import express from "express";
import { EXPIRED_SESSION_ERR_MSG } from "../../exceptions/errorMessages";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError";
import { Logger } from "../../logging/Logger";
import { OAuthProviderClient } from "../../network/clients/OAuthProviderClient";
import { PhotosService } from "../../services/PhotosService";

export const router = express.Router();

router.get("/", (req, res) => {
  if (!isAuthenticated(req)) return res.redirect("/sign-in");

  res.render("pages/home");
});

router.get("/sign-in", (req, res) => {
  if (isAuthenticated(req)) return res.redirect("/");

  res.render("pages/signIn", { error: popError(req) });
});

router.post("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) Logger.error(err);
    res.redirect("/sign-in");
  });
});

router.post("/", (req, res, next) => {
  const { accessToken } = req.session;

  if (!accessToken) {
    throw new UserFriendlyError(EXPIRED_SESSION_ERR_MSG);
  }

  refreshTokenIfNeeded(req)
    .then(() => new PhotosService(accessToken).findUnclassifiedPhotos())
    .then((photos) => res.render("pages/results", { photos }))
    .catch((err) => next(err));
});

router.get("*", (_, res) => {
  res.redirect("/");
});

async function refreshTokenIfNeeded(req: Request): Promise<void> {
  const { expiresAtMs, refreshToken } = req.session;

  if (!refreshToken) {
    Logger.error("Could not refresh token: refreshToken undefined");
  } else if (!expiresAtMs) {
    Logger.error("Could not refresh token: expiresAtMs undefined");
  } else if (Date.now() > expiresAtMs) {
    Logger.debug(`Refreshing access token: ${Date.now()} (Date.now()) > ${expiresAtMs} (expiresAtMs)`);
    const response = await new OAuthProviderClient().refreshAccessToken(refreshToken);
    req.session.accessToken = response.accessToken;
    req.session.expiresAtMs = response.expiresAtMs;
  } else {
    Logger.debug("Access token has yet to expire");
  }
}

function isAuthenticated(req: Request): boolean {
  return !!req.session.accessToken;
}

function popError(req: Request) {
  const { error } = req.session;
  delete req.session.error;
  return error;
}

import type { Request } from "express";
import express from "express";
import { register } from "prom-client";
import { EXPIRED_SESSION_ERR_MSG } from "../../exceptions/errorMessages.js";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError.js";
import { Logger } from "../../logging/Logger.js";
import { OAuthProviderClient } from "../../network/clients/OAuthProviderClient.js";
import { PhotosService } from "../../services/PhotosService.js";
import { redisClient } from "../redisClient.js";

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
  if (!req.session.accessToken) {
    throw new UserFriendlyError(EXPIRED_SESSION_ERR_MSG);
  }

  refreshTokenIfNeeded(req)
    .then(() => {
      if (!req.session.accessToken) throw new UserFriendlyError(EXPIRED_SESSION_ERR_MSG);
      return new PhotosService(req.session.accessToken).findUnclassifiedPhotos();
    })
    .then((photos) => res.render("pages/results", { photos }))
    .catch((err) => next(err));
});

router.get("/health", (_, res) => {
  if (process.env.NODE_ENV === "development") {
    res.status(200).send();
    return;
  }
  redisClient
    .ping()
    .then((reply) => {
      if (reply === "PONG") {
        res.status(200).send();
      } else {
        Logger.error(`Redis ping replied with: ${reply}`);
        res.status(503).send();
      }
    })
    .catch(err => {
      Logger.error(err);
      res.status(503).send();
    });
});

router.get("/metrics", (_, res) => {
  res.set("Content-Type", register.contentType);
  register.metrics()
    .then((metrics) => res.end(metrics))
    .catch((err) => {
      Logger.error(err);
      res.status(500).end(err);
    });
});

router.get("*", (_, res) => {
  res.redirect("/");
});

async function refreshTokenIfNeeded(req: Request): Promise<void> {
  const { expiresAtMs, refreshToken } = req.session;

  if (!refreshToken) {
    Logger.error("Missing refresh token in session data");
  } else if (!expiresAtMs) {
    Logger.error("Missing token expiration timestamp in session data");
  } else if (Date.now() > expiresAtMs) {
    Logger.debug(`Refreshing access token: ${new Date().toISOString()} > ${new Date(expiresAtMs).toISOString()}`);
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

import express, { Request } from "express";
import { Logger } from "../../logging/Logger";
import { OAuthProviderClient, OAUTH_PROVIDER_BASE_URL, REDIRECT_URI } from "../../network/clients/OAuthProviderClient";
import { PhotosService } from "../../services/PhotosService";

const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";

export const router = express.Router();

router.get("/", (req, res) => {
  if (!isAuthenticated(req)) {
    res.redirect("/sign-in");
    return;
  }

  res.render("pages/home");
});

router.get("/sign-in", (req, res) => {
  if (isAuthenticated(req)) {
    res.redirect("/");
    return;
  }

  res.render("pages/signIn", { error: popError(req) });
});

router.get("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      Logger.error(err, req.sessionID);
    }
  });
  res.redirect("/sign-in");
});

router.get("/oauth", (_, res) => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.GOOGLE_CLIENT_ID);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("response_type", "code");
  params.append("scope", PHOTOS_LIBRARY_READONLY_SCOPE);
  params.append("prompt", "select_account");

  res.redirect(`${OAUTH_PROVIDER_BASE_URL}/auth?${params.toString()}`);
});

router.get("/oauth/redirect", (req, res, next) => {
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

router.post("/", (req, res, next) => {
  const { bearer } = req.session;

  if (!bearer) {
    throw new Error("Could not view results while signed out. Sign in and try again.");
  }

  const photosService = new PhotosService({ id: req.sessionID, bearer });
  photosService.findUnclassifiedPhotos()
    .then((photos) => res.render("pages/results", { photos }))
    .catch((err) => next(err));
});

router.get("*", (_, res) => {
  res.redirect("/");
});

function isAuthenticated(req: Request): boolean {
  return !!req.session.bearer;
}

function popError(req: Request) {
  const { error } = req.session;
  delete req.session.error;
  return error;
}

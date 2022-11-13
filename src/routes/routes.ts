import express, { Request, Response } from "express";
import { OAUTH_PROVIDER_BASE_URL, REDIRECT_URI } from "../network/PhotosLibraryClient";
import { PhotosService } from "../services/PhotosService";
import { Cookie } from "../types/types";
import { logger } from "../utils/logger";

const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";
const RESPONSE_TYPE = "code";

const photosService = new PhotosService();

export const router = express.Router();

router.get("/", (req, res) => {
  if (!isAuthenticated(req)) {
    res.redirect("/sign-in");
    return;
  }

  res.render("home");
});

router.get("/sign-in", (req, res) => {
  if (isAuthenticated(req)) {
    res.redirect("/");
    return;
  }

  res.render("signIn", { error: popError(req) });
});

router.get("/sign-out", (_, res) => {
  res.clearCookie("auth_code");
  res.redirect("/sign-in");
});

router.get("/oauth", (_, res) => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.GOOGLE_CLIENT_ID);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("response_type", RESPONSE_TYPE);
  params.append("scope", PHOTOS_LIBRARY_READONLY_SCOPE);

  res.redirect(`${OAUTH_PROVIDER_BASE_URL}/auth?${params.toString()}`);
});

router.get("/oauth/redirect", (req, res) => {
  const { code, error } = req.query;
  if (typeof(error) === "string") {
    handleUnauthenticated(req, res, new Error(`Could not sign you in: ${error}`));
    return;
  }
  if (typeof(code) !== "string") {
    handleUnauthenticated(req, res, new Error("Could not sign you in: authentication failed"));
    return;
  }
  res.cookie("auth_code", code);
  res.redirect("/");
});

router.get("/results", (req, res) => {
  const { auth_code } = req.cookies as Cookie;

  if (!isAuthenticated(req)) {
    handleUnauthenticated(req, res, new Error("Could not view results while signed out. Sign in and try again."));
    return;
  }

  photosService.findUnclassifiedPhotos(auth_code || "")
    .then((photos) => res.render("results", { photos }))
    .catch((error: Error) => {
      handleUnauthenticated(req, res, error);
    });
});

function isAuthenticated(req: Request): boolean {
  const { auth_code } = req.cookies as Cookie;
  return !!auth_code;
}

function handleUnauthenticated(req: Request, res: Response, error: Error) {
  logger.error(error.message);
  req.session.error = error.message;
  res.clearCookie("auth_code");
  res.redirect("/sign-in");
}

function popError(req: Request) {
  const { error } = req.session;
  delete req.session.error;
  return error;
}

import express, { Request } from "express";
import { OAUTH_PROVIDER_BASE_URL, REDIRECT_URI } from "../network/PhotosLibraryClient";
import { PhotosService } from "../services/PhotosService";
import { Cookie } from "../types/types";
import { logger } from "../utils/logger";

const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";
const RESPONSE_TYPE = "code";

const photosService = new PhotosService();

export const router = express.Router();

router.get("/", (req, res) => {
  const { auth_code } = req.cookies as Cookie;

  if (!auth_code) {
    res.redirect("/login");
    return;
  }

  res.render("home");
});

router.get("/login", (req, res) => {
  const { auth_code } = req.cookies as Cookie;

  if (auth_code) {
    res.redirect("/");
    return;
  }

  res.render("login", { error: popError(req) });
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
    throw new Error(error);
  }
  if (typeof(code) !== "string") {
    throw new Error("Could not parse auth code");
  }
  res.cookie("auth_code", code);
  res.redirect("/");
});

router.get("/results", (req: Request, res) => {
  const getUnclassifiedPhotos = async () => {
    const { auth_code } = req.cookies as Cookie;

    if (!auth_code) {
      req.session.error = "Could not view results while signed out. Sign in and try again.";
      res.redirect("/login");
      return;
    }

    const unclassifiedPhotos = await photosService.findUnclassifiedPhotos(auth_code || "");
    res.render("results", { photos: unclassifiedPhotos });
  };

  getUnclassifiedPhotos().catch((e) => {
    logger.error(e);
    res.clearCookie("auth_code");
    res.render("home");
  });
});

function popError(req: Request) {
  const { error } = req.session;
  delete req.session.error;
  return error;
}

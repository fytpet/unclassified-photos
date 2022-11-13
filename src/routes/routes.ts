import express, { Request } from "express";
import { OAUTH_PROVIDER_BASE_URL, REDIRECT_URI } from "../network/PhotosLibraryClient";
import { PhotosService } from "../services/PhotosService";
import { logger } from "../utils/logger";

const PHOTOS_LIBRARY_READONLY_SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";
const RESPONSE_TYPE = "code";

const photosService = new PhotosService();

export const router = express.Router();

router.get("/", (_, res) => {
  res.redirect(`${process.env.BASE_URI}/home.html`);
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
  if (typeof (error) === "string") {
    throw new Error(error);
  }
  if (typeof (code) !== "string") {
    throw new Error("Could not parse auth code");
  }
  res.cookie("auth_code", code);
  res.redirect(`${process.env.BASE_URI}/home.html`);
});

router.get("/unclassified-photos", (req: Request, res) => {
  const getUnclassifiedPhotos = async () => {
    const { auth_code } = req.cookies as { auth_code?: string };

    if (!auth_code) {
      res.sendStatus(401);
      return;
    }

    const unclassifiedPhotos = await photosService.findUnclassifiedPhotos(auth_code);
    res.send(unclassifiedPhotos);
  };

  getUnclassifiedPhotos().catch((e) => {
    logger.error(e);
    res.clearCookie("auth_code");
    res.redirect(`${process.env.BASE_URI}/home.html`);
  });
});

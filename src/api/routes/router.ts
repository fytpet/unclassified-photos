import type { Request } from "express";
import express from "express";
import { EXPIRED_SESSION_ERR_MSG } from "../../exceptions/errorMessages";
import { UserFriendlyError } from "../../exceptions/UserFriendlyError";
import { Logger } from "../../logging/Logger";
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

router.get("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) Logger.error(err);
    res.redirect("/sign-in");
  });
});

router.post("/", (req, res, next) => {
  const { bearer } = req.session;

  if (!bearer) {
    throw new UserFriendlyError(EXPIRED_SESSION_ERR_MSG);
  }

  const photosService = new PhotosService(bearer);
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

import type { Request } from "express";
import express from "express";
import { Logger } from "../../logging/Logger";
import { PhotosService } from "../../services/PhotosService";

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

import type { Photo } from "../../types/types.js";

export const SOME_REDIRECT_CODE = "j2nsfd91h1";
export const SOME_ACCESS_TOKEN = "91md71h2bs8aa22f";
export const SOME_TOKEN_EXPIRATION: number = new Date(2020, 1, 2).valueOf();

export const SOME_OTHER_ACCESS_TOKEN = "m9sk1nd82n1s81";
export const SOME_OTHER_TOKEN_EXPIRATION: number = new Date(2020, 1, 4).valueOf();

export const SOME_ERROR_MESSAGE = "Oops! Something went wrong!";

export const photoFixture: Photo = {
  baseUrl: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/1029a283js8392",
  filename: "PXL_291214_0128172.jpg",
  id: "9182jsajn218dn1-2mias821bs83js",
  mediaMetadata: {
    creationTime: "2020-10-03T10-15-23Z",
    height: "4032",
    width: "3024"
  },
  mimeType: "image/jpeg",
  productUrl: "https://photos.google.com/lr/photo/A9m22s9akM3nsi1s"
};

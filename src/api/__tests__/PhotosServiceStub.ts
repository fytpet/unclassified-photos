import { UserFriendlyError } from "../../exceptions/UserFriendlyError.js";
import {
  photoFixture,
  SOME_ACCESS_TOKEN,
  SOME_ERROR_MESSAGE,
  SOME_OTHER_ACCESS_TOKEN,
  SOME_OTHER_TOKEN_EXPIRATION,
  SOME_TOKEN_EXPIRATION
} from "./constants.js";

class PhotosServiceStub {
  private readonly accessToken;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async findUnclassifiedPhotos() {
    if (Date.now() < SOME_TOKEN_EXPIRATION && this.accessToken === SOME_ACCESS_TOKEN) {
      return Promise.resolve([photoFixture]);
    }
    if (Date.now() < SOME_OTHER_TOKEN_EXPIRATION && this.accessToken === SOME_OTHER_ACCESS_TOKEN) {
      return Promise.resolve([photoFixture]);
    }
    return Promise.reject(new UserFriendlyError(SOME_ERROR_MESSAGE));
  }
}

jest.mock("../../services/PhotosService", () => ({
  PhotosService: PhotosServiceStub
}));

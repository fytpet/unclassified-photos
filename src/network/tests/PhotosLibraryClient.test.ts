jest.mock("../ApiClient");
import { Album } from "../../types/types";
import { PhotosLibraryClient } from "../PhotosLibraryClient";

const SOME_SESSION_ID = "28932";

const SOME_ALBUM: Album = {
  id: "91816",
  title: "Travel",
  productUrl: "www.example.com/travel",
  mediaItemsCount: "43",
  coverPhotoBaseUrl: "www.example.com/travel/cover",
  coverPhotoMediaItemId: "72619"
};

jest.mock("../ApiClient", () => {
  return {
    ApiClient: jest.fn().mockImplementation(() => {
      return {
        get: () => ({ data: {} }),
        post: () => ({ data: {} })
      };
    }),
  };
});

describe("PhotosLibraryClient", () => {
  it("should return empty list when photos response is empty", async () => {
    const client = new PhotosLibraryClient({ id: SOME_SESSION_ID });

    const actual = await client.fetchPhotos();

    expect(actual).toStrictEqual([]);
  });

  it("should return empty list when albums response is empty", async () => {
    const client = new PhotosLibraryClient({ id: SOME_SESSION_ID });

    const actual = await client.fetchAlbums();

    expect(actual).toStrictEqual([]);
  });

  it("should return empty list when photos of album response is empty", async () => {
    const client = new PhotosLibraryClient({ id: SOME_SESSION_ID });

    const actual = await client.fetchPhotosOfAlbum(SOME_ALBUM);

    expect(actual).toStrictEqual([]);
  });
});

vi.mock("../ApiClient", () => ({
  ApiClient: vi.fn(() => ({
    get: () => ({ data: {} }),
    post: () => ({ data: {} })
  })),
}));

import type { Album } from "../../../types/types.js";
import { PhotosLibraryClient } from "../PhotosLibraryClient.js";

const SOME_BEARER_TOKEN = "98123713afa113";

const SOME_ALBUM: Album = {
  id: "91816",
  title: "Travel",
  productUrl: "www.example.com/travel",
  mediaItemsCount: "43",
  coverPhotoBaseUrl: "www.example.com/travel/cover",
  coverPhotoMediaItemId: "72619"
};

describe("PhotosLibraryClient", () => {
  it("should return empty list when albums response is empty", async () => {
    const client = new PhotosLibraryClient(SOME_BEARER_TOKEN);

    const actual = await client.fetchAllAlbums();

    expect(actual).toStrictEqual([]);
  });

  it("should return empty list when photos of album response is empty", async () => {
    const client = new PhotosLibraryClient(SOME_BEARER_TOKEN);

    const actual = await client.fetchAllPhotosOfAlbum(SOME_ALBUM);

    expect(actual).toStrictEqual([]);
  });
});

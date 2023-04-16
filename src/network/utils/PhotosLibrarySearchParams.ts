const PAGE_SIZE_PARAM = "pageSize";
const ALBUM_ID_PARAM = "albumId";
const PAGE_TOKEN_PARAM = "pageToken";

export class PhotosLibrarySearchParams extends URLSearchParams {
  constructor(pageSize: number, albumId?: string) {
    super();

    super.append(PAGE_SIZE_PARAM, pageSize.toString());

    if (albumId !== undefined) {
      super.append(ALBUM_ID_PARAM, albumId);
    }
  }

  setNextPage(nextPageToken: string | undefined) {
    if (nextPageToken) {
      this.set(PAGE_TOKEN_PARAM, nextPageToken);
    } else {
      this.delete(PAGE_TOKEN_PARAM);
    }
  }

  hasNextPage() {
    return this.has(PAGE_TOKEN_PARAM);
  }
}

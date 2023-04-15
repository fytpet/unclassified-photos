const PAGE_TOKEN_PARAM = "pageToken";

export class PhotosLibrarySearchParams extends URLSearchParams {
  constructor(pageSize: number, albumId?: string) {
    super();

    super.append("pageSize", pageSize.toString());

    if (albumId !== undefined) {
      super.append("albumId", albumId);
    }
  }

  goToNextPage(nextPageToken: string | undefined) {
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

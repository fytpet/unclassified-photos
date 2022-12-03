export class PhotosLibrarySearchParams extends URLSearchParams {
  constructor(pageSize: number, albumId?: string) {
    super();

    super.append("pageSize", pageSize.toString());

    if (albumId !== undefined) {
      super.append("albumId", albumId);
    }
  }

  goToNextPage(nextPageToken: string) {
    if (nextPageToken) {
      this.set("pageToken", nextPageToken);
    } else {
      this.delete("pageToken");
    }
  }
}

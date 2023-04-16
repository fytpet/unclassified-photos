import { PageResults } from "../../types/types";
import { PhotosLibrarySearchParams } from "../utils/PhotosLibrarySearchParams";

export type PhotosLibraryQuery<T> = (p: PhotosLibrarySearchParams) => Promise<PageResults<T>>;

export class PhotosLibraryCursor<T> {
  protected params: PhotosLibrarySearchParams;
  protected fetchPage: PhotosLibraryQuery<T>;

  constructor(params: PhotosLibrarySearchParams, fetchPage: PhotosLibraryQuery<T>) {
    this.params = params;
    this.fetchPage = fetchPage;
  }

  async readNextPage() {
    const { results, nextPageToken } = await this.fetchPage(this.params);
  
    this.params.setNextPage(nextPageToken);

    return results?.filter(Boolean) ?? [];
  }

  hasNextPage() {
    return this.params.hasNextPage();
  }

  async readAll() {
    const results: T[] = [];
  
    do results.push(...await this.readNextPage());
    while (this.hasNextPage());
  
    return results;
  }
}

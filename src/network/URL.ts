export class URL {
  private readonly url: string;
  
  constructor(url?: string) {
    this.url = url ?? "";
  }

  withoutQueryString() {
    return this.url.split("?")[0] ?? this.url;
  }
}

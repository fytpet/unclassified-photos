export function withoutQuery(url: string) {
  return url.split("?")[0] ?? url;
}

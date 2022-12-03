export function removeQueryStringFromUrl(url: string) {
  return url.split("?")[0] ?? url;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/;`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

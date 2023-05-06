declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    expiresAtMs?: number;
    refreshToken?: string;
    error?: string;
  }
}

export {};

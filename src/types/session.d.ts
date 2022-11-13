declare module "express-session" {
  interface SessionData {
    bearer?: string;
    error?: string;
  }
}

export {};

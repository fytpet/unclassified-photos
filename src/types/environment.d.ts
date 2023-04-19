declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URI: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      PORT: string;
      HTTPS: string;
      SESSION_SECRET: string;
    }
  }
}

export {};

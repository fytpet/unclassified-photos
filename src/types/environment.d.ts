declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH_TOKEN: string;
    }
  }
}

export {};

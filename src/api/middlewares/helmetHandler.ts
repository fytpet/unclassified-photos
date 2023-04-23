import helmet from "helmet";

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "https://lh3.googleusercontent.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
};

export const helmetHandler = helmet(helmetConfig);

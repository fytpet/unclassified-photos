import { createClient } from "redis";
import { Logger } from "../logging/Logger";

export const redisClient = createClient({
  socket: {
    host: "redis",
    port: 6379
  }
});

if (process.env.NODE_ENV === "production") {
  redisClient.on("error", err => Logger.error(err));
  redisClient.connect().catch(err => Logger.error(err));
}

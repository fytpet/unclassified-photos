const PORT = "8080";
const BASE_URI = `http://localhost:${PORT}`;
const SESSION_SECRET = "somesessionsecret";

export default function() {
  process.env.PORT = PORT;
  process.env.BASE_URI = BASE_URI;
  process.env.SESSION_SECRET = SESSION_SECRET;
}

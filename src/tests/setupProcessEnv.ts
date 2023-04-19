export default function() {
  process.env.GOOGLE_CLIENT_ID = "somegoogleclientid";
  process.env.GOOGLE_CLIENT_SECRET = "somegoogleclientsecret";
  process.env.PORT = "8080";
  process.env.BASE_URI = "http://localhost:8080";
  process.env.HTTPS = "no";
  process.env.SESSION_SECRET = "somesessionsecret";
}

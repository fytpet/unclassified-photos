export default function() {
  process.env.NODE_ENV = "development";
  process.env.BASE_URI = "http://localhost:3000";
  process.env.HTTP_PORT = "3000";
  process.env.HTTPS_PORT = "443";
  process.env.GOOGLE_CLIENT_ID = "some.google.client.id";
  process.env.GOOGLE_CLIENT_SECRET = "some.google.client.secret";
  process.env.SESSION_SECRET = "some.session.secret";
}

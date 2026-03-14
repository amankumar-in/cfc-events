export default {
  enabled: true,
  origin: [
    "http://localhost:3000",
    "http://localhost:1337",
    "http://192.168.1.19:3000", // Add your IP address + port
    "https://events.coinsforcollege.org",
    "https://meea.coinsforcollege.org",
    "https://mea.coinsforcollege.org",
    "https://meea.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  headers: ["Content-Type", "Authorization", "Origin", "Accept"],
  keepHeaderOnError: true,
};

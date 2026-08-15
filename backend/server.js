process.env.NODE_NO_WARNINGS = "1";

const app = require("./app");

const PORT = process.env.PORT || 5000;

// Only start the HTTP server when running locally.
// Vercel will use the exported Express app.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
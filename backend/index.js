const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

// Custom modules
const logger = require("./logger");
const isValidCharacterName = require("./lib/isValidCharacterName");
const findCharacterNameAvailability = require("./lib/findCharacterNameAvailabilty");
const { MIN_CHARACTER_NAME_LENGTH, MAX_CHARACTER_NAME_LENGTH, MAX_CHARACTER_NAME_COMBINED_LENGTH } = require("./lib/CharacterNameContants");

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
const PORT = process.env.PORT || 6969;

// Middleware
app.use(helmet()); // For setting various HTTP headers for security
app.use(cors({ origin: true })); // For enabling CORS headers
app.use(bodyParser.json()); // For parsing application/json
app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
); // For logging HTTP requests
app.use("/api/", limiter); // Apply rate limiting to all API routes

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Routes
app.get("/api/character-availability", async (req, res) => {
  try {
    const { query } = req.query;

    logger.info("Query received:", query);

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    if (!isValidCharacterName(query)) {
      return res.status(400).json({
        error:
          `Invalid character name. Please ensure the name follows FFXIV's naming rules:\n` +
          `two words, each between ${MIN_CHARACTER_NAME_LENGTH} and ${MAX_CHARACTER_NAME_LENGTH} characters, with a combined maximum of ${MAX_CHARACTER_NAME_COMBINED_LENGTH} characters.`,
      });
    }

    const results = await findCharacterNameAvailability(query);
    return res.json(results);
  } catch (error) {
    logger.error("Error occurred while processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}/health`);
});

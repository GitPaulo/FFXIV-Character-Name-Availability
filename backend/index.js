const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Custom modules
const logger = require("./logger");
const { findCharacterNameAvailability } = require("./lib");

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per windowMs
});
const PORT = process.env.PORT || 6969;

// Middleware
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

const CHARACTER_NAME_REGEX = /^[a-zA-Z]+$/;
const MAX_CHARACTER_NAME_LENGTH = 15;
const MIN_CHARACTER_NAME_LENGTH = 2;
const MAX_CHARACTER_NAME_COMBINED_LENGTH = 20;

function isValidCharacterName(query) {
  const names = query.split(" ");

  if (names.length !== 2) {
    return false;
  }

  const [firstName, lastName] = names;

  if (
    !CHARACTER_NAME_REGEX.test(firstName) ||
    !CHARACTER_NAME_REGEX.test(lastName)
  ) {
    return false;
  }

  if (
    firstName.length < MIN_CHARACTER_NAME_LENGTH ||
    firstName.length > MAX_CHARACTER_NAME_LENGTH ||
    lastName.length < MIN_CHARACTER_NAME_LENGTH ||
    lastName.length > MAX_CHARACTER_NAME_LENGTH
  ) {
    return false;
  }

  if (firstName.length + lastName.length > MAX_CHARACTER_NAME_COMBINED_LENGTH) {
    return false;
  }

  return true;
}

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
          `Invalid character name. Please ensure the name follows FFXIV's naming rules:` +
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

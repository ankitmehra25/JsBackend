// Initialize dotenv
import dotenv from "dotenv";
// Import the database connection method
import connectDB from "./db/index.js";
// Import the express app
import app from "./app.js";

// Configure dotenv
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 4000;

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    app.on("error", err => {
      console.error("App startup error", err);
    });
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error("Mongo DB connection failed", err);
    process.exit(1);
  });

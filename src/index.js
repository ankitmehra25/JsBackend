// Initialize dotenv
import dotenv from "dotenv";
// Import the express library
import express from "express";
// Import the database connection method
import { connectDB } from "./db/index.js";

// Configure dotenv
dotenv.config({
  path: "./.env",
});

// Create an express app
const app = express();

// Connect to MongoDB and start the server
connectDB();

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

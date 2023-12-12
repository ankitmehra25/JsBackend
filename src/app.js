// Import the express library
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Create an express app
const app = express();
// Add middleware to enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// Add middleware to parse JSON
app.use(
  express.json({
    limit: "16kb",
  })
);
// Add middleware to parse URL-encoded bodies
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
// Add middleware to serve static files
app.use(express.static("public"));
// Add middleware to parse cookies
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";

// routes declaration
// http://localhost:3000/api/v1/users/register
// http://localhost:3000/api/v1/users/login
app.use("/api/v1/users", userRouter);

// export the express app
export default app;

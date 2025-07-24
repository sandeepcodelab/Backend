import express from "express";
import cors from "cors";
import healthcheckRouter from "./routes/healthcheck.routes.js"; // import router

const app = express()

// CORS middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)


// Comman middleware
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb"}))
app.use(express.static("public"))


// routes
app.use("/api/v1/healthcheck", healthcheckRouter)


export { app }
import express from "express";
import cors from "cors";

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

export { app }
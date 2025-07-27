import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// import router
import healthcheckRouter from "./routes/healthcheck.routes.js";
import registerUserRouter  from "./routes/user.routes.js";



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
app.use(cookieParser())

// routes
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/user", registerUserRouter)


export { app }
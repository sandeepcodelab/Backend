import express from "express";

// Import Router
import createUserRouter from "./routes/userRoutes.js"


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("Hello, this is CRUD operation in express JS!")
})

app.use("/api/v1/user", createUserRouter)

export { app }
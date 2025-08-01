import express from "express";


const app = express()
const PORT = 7500

app.use(express.json())


app.get("/", (req, res) => {
    console.log("Hello, This is working now !")
})


app.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`)
})
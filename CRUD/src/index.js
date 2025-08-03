import { app } from "./app.js";
import dotenv from "dotenv";
import dbConnect from "./config/dbConfig.js";


dotenv.config({
    path: "./.env"
})


const PORT = process.env.PORT||8001

dbConnect().then(() => {
    
    app.listen(PORT, () => {
        console.log(`Server is listening on port: ${PORT}`)
    })
    
}).catch((err) => {
    
    console.log(`Fail to connect with database: ${err}`)
})

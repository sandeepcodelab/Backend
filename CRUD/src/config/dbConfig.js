import mongoose from "mongoose";

const dbConnect = async() => {
    try {
        
        const dbConnection = await mongoose.connect(`${process.env.DATABASE_URI}/${process.env.DATABASE_NAME}`)
        
        console.log(`\n MongoDB connected ! DB host: ${dbConnection.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB connection error : ", error);
        process.exit(1);
    }
}

export default dbConnect
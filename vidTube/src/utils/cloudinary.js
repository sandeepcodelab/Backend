import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";


dotenv.config()


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        
        if(!localFilePath) return null
        
        const response = await cloudinary.uploader.upload(localFilePath, { 
            folder: 'vidTube', 
            resource_type: "auto" 
        })

        console.log(`File uploaded on cloudinary. File src: ${response.url}`);
        
        // Once the file uploaded on cloudinary, we would like to delete it from our server
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        console.log("Error on cloudinary: ", error)
        fs.unlinkSync(localFilePath)
        return null
    }
}


// Delete

const deleteFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted from cloudinary. Public id : ", result);

    } catch (error) {
        console.log("Error deleting from cloudinary : ", error)
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }
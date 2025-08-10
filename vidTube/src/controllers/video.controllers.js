import mongoose, {isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    //TODO: get all videos based on query, sort, pagination

})


const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description, duration } = req.body
    
    // TODO: get video, upload to cloudinary, create video

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required");
    }
    
    if (!duration || isNaN(duration) || duration <= 0) {
        throw new ApiError(400, "Duration must be a valid positive number");
    }

    const videoLocalPath = req.files?.video?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is missing");
    }
    
    let video;
    try {
        video = await uploadOnCloudinary(videoLocalPath);
        console.log("Video uploaded", video);

    } catch (error) {
        
        console.log("Error uploading video file", error);
        throw new ApiError(500, "Failed to upload video file");
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is missing");
    }

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        console.log("Thumbnail uploaded", thumbnail);
    } catch (error) {
        
        console.log("Error uploading thumbnail", error);
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    
    try {
        const uploadVideo = await Video.create({
            title, 
            description, 
            duration,
            videoFile: video.url,
            thumbnail: thumbnail?.url || "",
            isPublished: !!video?.url,
            owner: req.user._id,
        })
        
        const pulishedVideo = await Video.findById(updateVideo._id)
        if(!pulishedVideo){
            throw new ApiError(500, "Somthing went wrong while publishing a video");
        }

        return res.status(201).json(new ApiResponse(201, pulishedVideo, "Video published successfully"))

    } catch (error) {
        
        console.log("Video publishing is failed");

        if(video){
            await deleteFromCloudinary(video.public_id)
        }
        if(thumbnail){
            await deleteFromCloudinary(thumbnail.public_id)
        }
                
        throw new ApiError(500, "Somthing went wrong while publishing a video and thumbnail were deleted");
    }

})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs";


const generateAccessAndRefreshToken = async(userId) => {
    try {

        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "Coudnot found the user");
        }
    
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        
        throw new ApiError(500, "Somthing went wrong while generating access and refresh tokens");
        
    }
     
}


const registerUser = asyncHandler( async (req, res) => {

    if(!req.body || Object.keys(req.body).length === 0){
        throw new ApiError(400, "Request body cannot be empty");
        
    }

    const {fullname, email, username, password} = req.body

    // Validation
    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
        
    }

    // Image path
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        fs.unlinkSync(avatarLocalPath)
        fs.unlinkSync(coverImageLocalPath)
        throw new ApiError(409, "User with email or username already exists");
    }


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
        
    }


    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar", avatar)
    } catch (error) {
        console.log("Error uploading avatar ", error)
        throw new ApiError(500, "Failed to upload avatar");
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
        console.log("Uploaded avatar", coverImage)
    } catch (error) {
        console.log("Error uploading coverImage ", error)
        throw new ApiError(500, "Failed to upload coverImage");
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering a user")
        }
    
        return res.status(201)
                    .json(new ApiResponse(200, createdUser, "User registered successfully"))
         
    } catch (error) {

        console.log("User creation is failed")
        
        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }
        
        throw new ApiError(500, "Somthing went wrong while registering a user and images were deleted");
    }
})


const loginUser = asyncHandler( async(req, res) => {

    if(!req.body || Object.keys(req.body).length === 0){
        throw new ApiError(400, "Request body cannot be empty");
        
    }

    const {email, username, password} = req.body

    // Validation
    if(!email || !username){
        throw new ApiError(400, "Username or Email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User not found");
    }

    // Validation
    if(!password){
        throw new ApiError(400, "Password is required");
    }

    // ValidatePassword
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json( new ApiResponse(
                    200, 
                    {user: loggedInUser, accessToken, refreshToken}, 
                    "User logged in successfully"
                ))
})


const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json( new ApiResponse(200, {}, "User logged out successfully"))
})


const refreshAccessToken = asyncHandler( async(req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }
        
        if(!incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token or expired");
        }
        
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json( new ApiResponse(
                    200, 
                    {accessToken, refreshToken: newRefreshToken}, 
                    "Access token refreshed successfully"
                ))
        
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while refreshing access token");
        
    }
})


const changeCurrentPassword = asyncHandler( async(req, res) => {

    if(!req.body || Object.keys(req.body).length === 0){
        throw new ApiError(400, "Request body cannot be empty");
        
    }

    const {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword){
        throw new ApiError(401, "Old and new passwords are required");
    }

    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordValid){
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res.status(200)
                .json( new ApiResponse(200, {newPassword}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler( async(req, res) => {
    
    return res.status(200)
                .json(new ApiResponse(200, req.user, "Current user details"))
})


const updateAccountDetails = asyncHandler( async(req, res) => {

    const {username, email, fullname} = req.body

    if (!username || !email || fullname) {
        throw new ApiError(400, "Username, email and fullname are required");
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username,
                email: email,
                fullname
            }
        },
        {new: ture}
        
    ).select("-password -refreshToken")
    
    return res.status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler( async(req, res) => {
    
    const avatarLocalPath = req.file?.avatar?.[0].path
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "File is required");
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if (!avatar.url) {
        throw new ApiError(500, "Something went wrong while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        res.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}

    ).select("-password -refreshToken")

    return res.status(200)
                .json(new ApiResponse(200, user, "Avatar updated successfully"))
})


const updateUserCoverImage = asyncHandler( async(req, res) => {
    
    const coverImageLocalPath = req.file?.coverImage?.[0].path
    
    if (!coverImageLocalPath) {
        throw new ApiError(400, "File is required");
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if (!coverImage.url) {
        throw new ApiError(500, "Something went wrong while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        res.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}

    ).select("-password -refreshToken")

    return res.status(200)
                .json(new ApiResponse(200, user, "Cover image updated successfully"))
})


const getUserChannelProfile = asyncHandler( async(req, res) => {
    
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelsSubcribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                // Project only the necessary data
                $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    subscribersCount: 1,
                    channelsSubcribedToCount: 1,
                    isSubscribed: 1,
                    coverImage: 1
                } 
            }
        ]
    )

    if(!channel?.length){
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json( new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
})


const getWatchHistory = asyncHandler( async(req, res) => {

    const user = User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json( new ApiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully"))
})


export { 
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
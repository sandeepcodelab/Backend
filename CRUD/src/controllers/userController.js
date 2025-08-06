import { User } from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createUser = asyncHandler( async (req, res) => {

    if (!req.body || Object.keys(req.body).length === 0) {

        return res.status(400).json({
            success: false,
            message: "Body cannot be empty, all fields are required"
        })
    }

    const {firstname, lastname, email, password} = req.body

    if ([firstname, lastname, email, password].some((field) => field?.trim() === "")) {
        
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    const existingUser = await User.findOne({email});

    if(existingUser){
        
        return res.status(409).json({
            success: false,
            message: "Email already exists",
        })
    }
        
    const user = await User.create({
        firstname,
        lastname,
        email: email,
        password
    })  

    const userData = await User.findById(user._id).select("-password")
    if(!userData){
        return res.status(500).json({
            success: false,
            message: "Something went wrong while registering a user"
        })
    }

    return res.status(201).json({
        success: true,
        message: "New user created successfully",
        userDetails: userData
    })

})


const getAllUsers = asyncHandler( async (req, res) => {

    const allUsers = await User.find().select("-password")

    if(!allUsers){
        return res.status(404).json({
            success: false,
            message: "Not found",
        })
    }

    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users: allUsers
    })
})


const singleUser = asyncHandler( async (req, res) => {

    const userID = req.params.id
    if(!userID){
        return res.status(400).json({
            success: false,
            message: "User id is required",
        })
    }
    
    const user = await User.findById(userID).select("-password")
    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found",
        })
    }
    
    return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        user: user
    })
    
})


const updateUser = asyncHandler( async (req, res) => {

    const userID = req.params.id
    
    if(!userID){
        return res.status(400).json({
            success: false,
            message: "User id is required"
        })
    }

    if(!req.body || Object.keys(req.body).length === 0){
        return res.status(400).json({
            success: false,
            message: "Body cannot be empty"
        })
    }

    const {firstname, lastname, password} = req.body

    if(!firstname || firstname.trim() === "" && !lastname || lastname.trim() === ""){
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        })
    }

    if(req.body.hasOwnProperty("password")){
        if (!password || password.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Password is required",
            })
        }
    }

    const user = await User.findById(userID)

    if(!user){
        return res.status(404).json({
                success: false,
                message: "User not found",
            })
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.password = password;

    await user.save();

    const userData = user.toObject();
    delete userData.password

    return res.status(200).json({
            success: true,
            message: "User updated successfully",
            userData
        })
})


export { createUser, getAllUsers, singleUser, updateUser }
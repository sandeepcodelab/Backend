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


export { createUser }
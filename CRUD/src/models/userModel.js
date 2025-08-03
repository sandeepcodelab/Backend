import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        firstname: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        lastname: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        }
        
    }
)

userSchema.pre("save", async function (next) {
    
    if (!this.isModified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)

    next()
})


export const User = mongoose.model("User", userSchema)
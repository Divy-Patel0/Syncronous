import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { compare } from "bcrypt";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinaryConfig.js";
import crypto from "crypto";
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and Password is required");
        }
        const userfind = await User.findOne({ email });
        if(userfind){
            return response.status(403).send("Email and Password is required");
        }
        const user = await User.create({ email, password });
        response.cookie("jwt", createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None",
        })
        return response.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            },
        })
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server error");
    }
};

export const login = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and Password is required");
        }
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).send("User with the given not found");
        }
        const auth = await compare(password, user.password);
        if (!auth) {
            return response.status(401).send("Password is incorrect")
        }
        response.cookie("jwt", createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None",
        })
        return response.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            },
        })
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server error");
    }
};

export const getUserInfo = async (request, response, next) => {
    try {
        const userData = await User.findById(request.userId);
        if (!userData) {
            return response.status(404).send("User with given id not found.");
        }
        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        })
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server error");
    }
};

export const updateProfile = async (request, response, next) => {
    try {
        const { userId } = request;
        const { firstName, lastName, color } = request.body;
        if (!firstName || !lastName) {
            return response.status(400).send("Firstname Lastname and color is required.");
        }


        const userData = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            color,
            profileSetup: true
        },
            { new: true, runValidators: true }
        )
        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        })
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server error");
    }
};

export const addProfileImage = async (request, response, next) => {
    try {
        if(!request.file){
            return response.status(400).send("File is required.");
        }

        function generatePublicId(originalname) {
              const timestamp = Date.now();
              const name = path.parse(originalname).name;
              return `user_uploads/${name}-${timestamp}`;
            }
            // // Create directory if it doesn't exist
            // mkdirSync(fileDir, { recursive: true });
            
            // renameSync(request.file.path, fileName);
            
            const filePath = request.file.path;
            // const fileExt = path.extname(request.file.originalname).slice(1)
            const publicId = generatePublicId(request.file.originalname);
            const result = await cloudinary.uploader.upload(filePath, {
              resource_type: 'auto',
              public_id: publicId,
            //   format: fileExt,
            });
            console.log("file uploaded", result.url,result.format)
            fs.unlinkSync(filePath);
        // const date = Date.now();
        // let fileName = "uploads/profiles/" +date + request.file.originalname;
        // renameSync(request.file.path,fileName);

        const updatedUser = await User.findByIdAndUpdate(request.userId,{image:result.url},{new:true, runValidators:true});

        return response.status(200).json({
            
            image: updatedUser.image,
            
        });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server error");
    }
};

export const removeProfileImage = async (request, response, next) => {
    try {
        const { userId } = request;
        const user = await User.findById(userId);

        if(!user){
            return response.status(404).send("User not found.")
        }

        // if(user.image){
        //     unlinkSync(user.image);
        // }

        user.image = null;
        await user.save();
        
        return response.status(200).send("Profile image removed successfully.")
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server error");
    }
};


export const logout = async (request, response, next) => {
    try {
        
        response.cookie("jwt","",{maxAge:1,secure:true,sameSite:"None"});

        return response.status(200).send("Logout successfully.")
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server error");
    }
};

const otpStore = {}; // Temporary in-memory store for OTPs

// Function to generate OTP
export const generateOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const existingOtp = otpStore[email];
    if (existingOtp && existingOtp.expiresAt > Date.now()) {
        return res.status(429).json({ message: 'OTP already sent. Please wait for it to expire before requesting a new one.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 1 * 60 * 1000 }; // OTP valid for 1 minute

    // Send OTP via email
    try {
        await transporter.sendMail({
            from: `Your Organization <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 1 minute.\n\nThank you for using our service.\n\nBest regards,\nsyncronus`,
        });
        res.status(200).json({ message: 'OTP sent successfully to your email.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
};

// Function to verify OTP
export const verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const storedOtp = otpStore[email];
    if (!storedOtp) {
        return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    delete otpStore[email]; // OTP is valid, remove it from the store
    res.status(200).json({ message: 'OTP verified successfully' });
};
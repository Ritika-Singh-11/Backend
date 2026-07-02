import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
   const generateAccessAndRefreshToken = async (userId) => {
   try{
   const user=await User.findById(userId)
  const accessToken= user.generateAccessToken()
  const refreshToken= user.generateRefreshToken()
  
  user.refreshToken=refreshToken
  await user.save({validateBeforeSave: false})
  return {accessToken, refreshToken}

   }
   catch(error){
    throw new ApiError(500, "something went wrong while generating Access and refresh  tokens")
   }
   }
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

  

    const {fullName, email, username, password } = req.body
    console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
     }


//User are connected to database directly can talk to database
     //   we are using it for checking that is user already exist or not
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // req.body give all data but middleware gives some also it add some fields in req
    // multer give access of req.files

    //console.log(req.files);

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }
    

    if (!avatarLocalPath) {
    
// console.log("BODY:", req.body);
// console.log("FILES:", req.files);

        throw new ApiError(400, "Avatar file is required")
    }

  
    //  console.log("Before Cloudinary upload");
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    //console.log("After Cloudinary upload");
    //console.log(avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   
    //console.log("Before User.create()");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

      })

 const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
     
    const {email, username, password } = req.body
   console.log("email: ", email);
   console.log("username: ", username);
   if(!username && !email){
  throw new ApiError(400, "Username or email is required")
   }
  
  const user= await User.findOne({
    //mongodb operators->or and
    $or:[{username}, {email}]
   })
  if(!user){
    throw new ApiError(404, "User not found")
  }
  
  const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){ 
  throw new ApiError(401, "Invalid user credentials")
      }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
   
     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})
   

 const logoutUser=asyncHandler(async(req,res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
        $set :{
            refreshToken:undefined
       }  
    },
        {
            new : true
        }
   
  )
  const options = {
        httpOnly: true,
        secure: true
    }
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User logged out"))

 })
  
 const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
req.cookies.refreshToken||req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "unAuthorized, request")}
  
  try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


  })
   

    
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}

// Access Token: A short-lived token that is used to authenticate requests to the server.
//  It is usually included in the Authorization header of HTTP requests. Access tokens have a limited lifespan (e.g., 15 minutes) and are used to access protected resources.
// Refresh Token: A long-lived token that is used to obtain a new access token when the current one expires.
// User Login
//       │
//       ▼
// Generate Access Token (15 min)
// Generate Refresh Token (7 days)
//       │
//       ▼
// Store Refresh Token in DB
//       │
//       ▼
// Send both tokens to client
// LATER
// User makes API request
//         │
//         ▼
// Access Token valid?
//        │
//  ┌─────┴─────┐
//  │           │
// Yes         No (Expired)
//  │           │
//  ▼           ▼
// Allow      Client calls
// Request    /refresh-token
//                │
//                ▼
//        Verify Refresh Token
//                │
//         ┌──────┴───────┐
//         │              │
//       Valid          Invalid
//         │              │
//         ▼              ▼
// Generate New       Login Again
// Access Token &
// Refresh Token
// 
import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Rider from "../model/rider.js";
import rider from "../model/rider.js";


export const addRiderProfile = TryCatch(async(req:AuthenticatedRequest,res)=>{

    const user = req.user;

    if(!user){
        return res.status(401).json({message:"Unauthorized"});
    }
    if(user.role !== "rider"){
        return res.status(403).json({message:"Only riders can add profiles"});
    }
    const file = req.file;

    if(!file){
        return res.status(400).json({message:"Profile picture is required"});
    }
    const fileBuffer = getBuffer(file);

    if(!fileBuffer?.content){
        return res.status(400).json({message:"failed to generate image buffer"});
    }
     const {data:uploadResult} = await axios.post(`${process.env.UTILS_SERVICE}/api/v1/upload`,{
        buffer: fileBuffer.content,
      
    },)

      const {
        phoneNumber,
        adhaarNumber,
        drivingLicenseNumber,
        latitude,
        longitude,
    } = req.body;
      
      if(!phoneNumber || !adhaarNumber || !drivingLicenseNumber || latitude === undefined || longitude === undefined    ){
        return res.status(400).json({message:"All fields are required"});
      }
      const existingProfile = await Rider.findOne({userId:user._id});
      if(existingProfile){
        return res.status(400).json({message:"Profile already exists"});
      }
      const riderProfile = await Rider.create({
        userId:user._id,
        picture:uploadResult.url,
        phone:phoneNumber,
        adhaarNumber,
        drivingLicenseNumber,
        location: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
        ,isAvailable:false
        ,isVerified:false,
      });

      res.status(201).json({message:"Rider profile created successfully",riderProfile});
    })

export const fetchMyProfile = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;

    if(!user){
        return res.status(401).json({message:"Unauthorized"});
    }
    if(user.role !== "rider"){
        return res.status(403).json({message:"Only riders can access profiles"});
    }
    const riderProfile = await Rider.findOne({userId:user._id});

    if(!riderProfile){
        return res.status(404).json({message:"Rider profile not found"});
    }
    res.status(200).json({message:"Rider profile fetched successfully",riderProfile});
})

export const toggleRiderAvailability = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;

    if(!user){
        return res.status(401).json({message:"Unauthorized"});
    }
    if(user.role !== "rider"){
        return res.status(403).json({message:"Only riders can update availability"});
    }

    const{isAvailable,latitude,longitude} = req.body;

     if(isAvailable !== "boolean"){
        return res.status(400).json({message:"isAvailable must be a boolean"});
      }
         if(latitude === undefined || longitude === undefined){
        return res.status(400).json({message:"Location is required"});
         }
    const rider = await Rider.findOne({userId:user._id});

    if(!rider){
        return res.status(404).json({message:"Rider profile not found"});
    }

   if(isAvailable && !rider.isVerified){
    return res.status(403).json({message:"Rider is not verified yet"});
   }
    rider.isAvailable = isAvailable;
    rider.location = {
        type:"Point",
        coordinates:[longitude,latitude]
    }
    rider.lastActiveAt = new Date();
    await rider.save();
    res.status(200).json({message:isAvailable? "Rider is now available":"Rider is now unavailable",
        rider});

})
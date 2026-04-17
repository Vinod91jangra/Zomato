import axios from "axios";
import jwt from "jsonwebtoken";
import getBuffer from "../config/datauri";
import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import Restaurant from "../model/Restaurant";



export const addRestaurant = TryCatch(async(req:AuthenticatedRequest,res) => {
    const user = req.user;

    if(!user){
        return res.status(401).json({
            message:"Unauthorized"              })
    }  

    const existingRestaurant = await Restaurant.findOne({owner:user?._id});
    
    if(existingRestaurant){
        return res.status(400).json({
            message:"You already have a restaurant"
        })
    }

    const {name,description,latitude,longitude,formattedaddress,phone} = req.body;

    if(!name || !latitude || !longitude ){   
    return res.status(400).json({
        message:"Name, Latitude and Longitude are required"
});
}

   const file = req.file;
    if(!file){
        return res.status(400).json({
            message:"Please give Image"
         })

    }
    const fileBuffer = getBuffer(file);

    if(!fileBuffer?.content){
        return res.status(400).json({
            message:"Failed to create file buffer"
        });

    }

    const { data: uploadResult} = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`,{
        buffer:fileBuffer.content,
    });

    const restaurant = await Restaurant.create({
        name,
        description,
        phone: Number(phone),
        image:uploadResult.url,
        ownerId: user._id,
        autoLocation:{
            type:"Point",
            coordinates:[Number(longitude),Number(latitude)],
            formattedAddress: formattedaddress,
        },
        isVerified:false,
        isOpen: false,
    });
    return res.status(201).json({   
        message:"Restaurant created successfully",
        restaurant,
    });
});

export const fetchMyRestaurant = TryCatch(async(req:AuthenticatedRequest,res) => {
    const user = req.user;  
    if(!user){
        return res.status(401).json({
            message:"Unauthorized"              })
    }   
    const restaurant = await Restaurant.findOne({ownerId:user._id});

    if(!restaurant){
        return res.status(404).json({
            message:"Restaurant not found"
        })
    }
    if(!user.restaurantId){
        const token = jwt.sign({
            user:{
                ...req.user,
                restaurantId: restaurant._id,
            },
        }, process.env.JWT_SEC as string, { expiresIn: "15d" });
        return res.json({
            restaurant,
            token
        })
    }
    return res.status(200).json({
        restaurant
    });
}); 


export const updateStatusRestaurant = TryCatch(async(req:AuthenticatedRequest,res) => {
       if(!req.user){
        return res.status(403).json({
            message:"Please Login"
        });
       }
       const {status} =req.body;

       if(typeof status !== "boolean"){
        return res.status(400).json({
          message:"Status must be a boolean value",
        });

       }
       const restaurant = await Restaurant.findOneAndUpdate(
        {ownerId:req.user._id},
        {isOpen:status},
        {new:true}
       );

       if(!restaurant){
        return res.status(404).json({  
            message:"Restaurant not found",
         });
       }
     
         return res.json({
            message:`Restaurant is now ${status? "open":"closed"}`,
            restaurant,
         });
})

export const updateRestaurant = TryCatch(async(req:AuthenticatedRequest,res) => {
    if(!req.user){
        return res.status(403).json({ 
            message:"Please Login"
          });
        }

        const {name,description} = req.body;
        const restaurant = await Restaurant.findOneAndUpdate(
            {ownerId:req.user._id},
            {name,description},
            {new:true}
        );
        if(!restaurant){
            return res.status(404).json({
                message:"Restaurant not found",
            });
        }
        return res.json({
            message:"Restaurant updated successfully",
            restaurant,
        });
    });


    export const getNearbyRestaurant = TryCatch(async(req,res)=>{

        const {latitude ,longitude, radius = 5000,search =""} = req.query;
        if(!latitude || !longitude){
            return res.status(400).json({
                message:"Latitude and Longitude are required",
            });
        }

        const query:any ={
            isVerified:true,          
        }

         if(search && typeof search === "string"){
            query.name = {$regex: search, $options:"i"};
         }

         const restaurants = await Restaurant.aggregate([
            {
            $geoNear:{
                key:"autoLocation",
            near:{

        type:"Point",
        coordinates:[Number(longitude),Number(latitude)]},
        distanceField:"distance",
        maxDistance:Number(radius),
        spherical:true,
        query
    },


    },      {
        $sort :{
            isOpen: -1,
            distance:1,
        },
    },

    {
        $addFields:{
            distanceKm:{
                $round:[{$divide:["$distance",1000]},2],
            }
        }
    }
] );
          res.json({
            success:true,
            count: restaurants.length,
            restaurants,
          })

       });

       export const fetchSingleRestaurant = TryCatch(async(req,res)=>{

        const restaurant = await Restaurant.findById(req.params.id);
        res.json({
            restaurant
        });

       });
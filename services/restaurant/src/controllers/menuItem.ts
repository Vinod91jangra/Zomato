import axios from "axios";
import getBuffer from "../config/datauri";
import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import Restaurant from "../model/Restaurant";
import MenuItems from "../model/MenuItems";



export const addMenuItem = TryCatch(async(req:AuthenticatedRequest,res) => {

    if(!req.user){
        return res.status(401).json({
            message:"Please Login"
        })
    }

    const restaurant = await Restaurant.findOne({
        ownerId: req.user?._id
    });
    if(!restaurant){
        return res.status(404).json({
            message:"No restaurant found"
        })
    }
    const {name,description,price} = req.body;
    if(!name || !price){
        return res.status(400).json({
            message:"name and price are required"
        })
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

    const item = await MenuItems.create({
        name,
        description,
        price,
        restaurantId:restaurant._id,
        image:uploadResult.url,

    })
    res.json({
        message:"item added successfully",
        item
    });

    
});

export const getAllItems = TryCatch(async(req:AuthenticatedRequest,res) =>{


    const {id} = req.params;
    if(!id){
        return res.status(400).json({
            message:"Id is required"
        });
    }

    const items = await MenuItems.find({restaurantId:id});
    res.json({

        items
    })
});

export const deleteMenuItem = TryCatch(async(req:AuthenticatedRequest,res) =>{

     if(!req.user){
        return res.status(401).json({
            message:"Please Login"
        })
    }
     const {itemId} = req.params;
    if(!itemId){
        return res.status(400).json({
            message:"Id is required"
        });
    }
    const Item = await MenuItems.findById(itemId);
    if(!Item){
        return res.status(404).json({
            message:"no item found"
        })
    }

    const restaurant = await Restaurant.findOne({
        _id:Item.restaurantId,
        ownerId:req.user._id,

    },)
     if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant found with this id"
        })
     }

     await Item.deleteOne();

     res.json({
        message:"Menu item Deleted Successfully"
     });

})

export const toggleMenuItemAvailablity = TryCatch(async(req:AuthenticatedRequest,res) =>{
   if(!req.user){
        return res.status(401).json({
            message:"Please Login"
        })
    }
     const {itemId} = req.params;
    if(!itemId){
        return res.status(400).json({
            message:"Id is required"
        });
    }
    const Item = await MenuItems.findById(itemId);
    if(!Item){
        return res.status(404).json({
            message:"no item found"
        })
    }

    const restaurant = await Restaurant.findOne({
        _id:Item.restaurantId,
        ownerId:req.user._id,

    },)
     if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant found with this id"
        })
     }

     Item.isAvailable = !Item.isAvailable;
     await Item.save()

     res.json({
        message:`Item Marked as ${Item.isAvailable? "available":"unavailable"}`,
     })
        
     
})
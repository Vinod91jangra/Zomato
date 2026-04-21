import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import Address from "../model/Address";


export const addAddress = TryCatch(async(req:AuthenticatedRequest,res) => {
        const user= req.user;
        if(!user){
            return res.status(401).json({
                message:"Please Login"
            })
        }
        const {formattedAddress,location,mobile,latitude,longitude} = req.body;
        if(!formattedAddress || !mobile || latitude===undefined || longitude===undefined){
            return res.status(400).json({
                message:"All fields are required"
            })
        }
        
        const address = await Address.create({
            userId:user._id,
            formattedAddress,
            mobile,
            location:{
                type:"Point",
                coordinates:[Number(longitude),Number(latitude)]

            },
        })
        res.status(201).json({
            message:"Address added successfully",
            address
        })

})

export const deleteAddress = TryCatch(async(req:AuthenticatedRequest,res) => {

    const user= req.user;
    if(!user){
        return res.status(401).json({
            message:"Please Login"
        })
    }
    const {id} = req.params;
    if(!id){
        return res.status(400).json({
            message:"Address id is required"
        })
    }
    const address = await Address.findOne({
        _id:id,
        userId:user._id.toString()})
    if(!address){
        return res.status(404).json({
            message:"Address not found"
        })
    }
    await address.deleteOne();
        res.json({
            message:"Address deleted successfully",
            address
        })
})

export const getAddresses = TryCatch(async(req:AuthenticatedRequest,res) => 
    {
       const user = req.user;
       if(!user){
        res.status(400).json({
            message:"Please Login"
        })
       }
        
       const addresses = await Address.find(
        {userId:user._id.toString()},
        ).sort({createdAt:-1})  

     if(!addresses){
        res.status(404).json({
            message:"No Addresses Found"
        })
     }

     res.status(200).json(addresses)

    })
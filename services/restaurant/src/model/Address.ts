

import mongoose ,{Schema,Document} from "mongoose"

export interface IAddress extends Document{
    userId: mongoose.Types.ObjectId;
   
   formattedAddress: string;
    location:{
        type:"Point",
        coordinates:[number,number]
    }
    updatedAt: Date;
    createdAt: Date;
    mobile: number;
}

const schema = new Schema<IAddress>({

    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true, 
          },
    mobile:{
            type:Number,
            required:true,},

            formattedAddress:{
        type:String,
        required:true,
            },

       location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point",
        },
        coordinates:{
            type:[Number],
            required:true,
        },},
 
    },
    {
    timestamps:true,
    }
);

schema.index({location:"2dsphere"});
export default mongoose.model<IAddress>("Address",schema)

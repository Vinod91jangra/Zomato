import mongoose ,{Schema,Document}from  "mongoose"

export interface ICart extends Document{
    userId: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
     quantity: number;


    updatedAt: Date;
    createdAt: Date;
}

const schema = new Schema<ICart>({
    userId:{
        type:Schema.Types.ObjectId,
        required:true, 
    index:true,  },
    restaurantId:{  
        type:Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true, 
        index:true,  },
    itemId:{
        type:Schema.Types.ObjectId,
        ref:"MenuItem",
        index:true,
        required:true,  },
    quantity:{
        type:Number,
        required:true,
        min:1,
    },

},{
    timestamps:true,
}
);

schema.index({userId:1, itemId:1,restaurantId:1}, {unique:true});
export default mongoose.models.Cart || mongoose.model<ICart>("Cart", schema);


import mongoose from "mongoose"

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI as string,{
            dbName:"ZomatoClone",
        })
        console.log("connected to mongoDB");
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;
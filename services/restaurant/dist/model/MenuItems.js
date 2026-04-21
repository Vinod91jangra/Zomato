import mongoose, { Schema as MongooseSchema } from "mongoose";
const menuItemSchema = new MongooseSchema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    image: {
        type: String,
        trim: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("MenuItem", menuItemSchema);

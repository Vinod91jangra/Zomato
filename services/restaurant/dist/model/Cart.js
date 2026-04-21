import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
    },
    itemId: {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
        index: true,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
}, {
    timestamps: true,
});
schema.index({ userId: 1, itemId: 1, restaurantId: 1 }, { unique: true });
export default mongoose.models.Cart || mongoose.model("Cart", schema);

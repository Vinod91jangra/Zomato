import mongoose, { Schema } from "mongoose";
const OrderSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    restaurantId: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        required: true,
    },
    riderId: {
        type: String,
        default: null
    },
    riderPhone: {
        type: Number,
        default: null
    },
    riderName: {
        type: String,
        default: null
    },
    riderAmount: {
        type: Number,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
    },
    platformFee: {
        type: Number,
    },
    deliveryFee: {
        type: Number,
    },
    totalAmount: {
        type: Number,
    },
    addressId: {
        type: String,
        required: true,
    },
    items: [
        {
            itemId: String,
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    deliveryAddress: {
        formattedAddress: {
            type: String, required: true
        },
        mobile: {
            type: Number, required: true
        },
        latitude: Number,
        longitude: Number
    },
    status: {
        type: String,
        enum: ["placed",
            "accepted", "preparing",
            "ready_for_rider", "rider_assigned",
            "picked_up", "delivered", "cancelled"],
        default: "placed"
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "stripe"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    expiresAt: {
        type: Date,
        index: { expireAfterSeconds: 0 }
    }
}, {
    timestamps: true
});
export default mongoose.model("Order", OrderSchema);

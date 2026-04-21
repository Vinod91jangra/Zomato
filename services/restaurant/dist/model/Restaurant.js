import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
    },
    autoLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        formattedAddress: {
            type: String,
        }
    },
    isOpen: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
schema.index({ autoLocation: "2dsphere" });
export default mongoose.model("Restaurant", schema);

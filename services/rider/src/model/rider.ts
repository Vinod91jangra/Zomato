import mongoose, { Document, Schema } from "mongoose";


export interface IRider extends Document {

    userId: string;
    picture: string;
    phone: Number;
    adhaarNumber: string;
    drivingLicenseNumber: string;
    isVerified: boolean;
    location: {
        type:"Point",
        coordinates: [number, number]
    },
    isAvailable: boolean;
    lastActiveAt: Date;
    createdAt: Date;
    updatedAt: Date;

}

const schema = new Schema<IRider>({
    userId: { type: String, required: true, unique: true },
    picture: { type: String, required: true },
    phone: { type: Number, required: true },
    adhaarNumber: { type: String, required: true,unique:true },
    drivingLicenseNumber: { type: String, required: true,unique:true },
    isVerified: { type: Boolean, default: false },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    isAvailable: { type: Boolean, default: true },
    lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });

schema.index({ location: "2dsphere" });

const Rider = mongoose.model<IRider>("Rider", schema);

export default Rider;
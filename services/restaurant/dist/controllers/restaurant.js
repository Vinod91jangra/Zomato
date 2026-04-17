"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSingleRestaurant = exports.getNearbyRestaurant = exports.updateRestaurant = exports.updateStatusRestaurant = exports.fetchMyRestaurant = exports.addRestaurant = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const datauri_1 = __importDefault(require("../config/datauri"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const Restaurant_1 = __importDefault(require("../model/Restaurant"));
exports.addRestaurant = (0, trycatch_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const existingRestaurant = await Restaurant_1.default.findOne({ owner: user?._id });
    if (existingRestaurant) {
        return res.status(400).json({
            message: "You already have a restaurant"
        });
    }
    const { name, description, latitude, longitude, formattedaddress, phone } = req.body;
    if (!name || !latitude || !longitude) {
        return res.status(400).json({
            message: "Name, Latitude and Longitude are required"
        });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "Please give Image"
        });
    }
    const fileBuffer = (0, datauri_1.default)(file);
    if (!fileBuffer?.content) {
        return res.status(400).json({
            message: "Failed to create file buffer"
        });
    }
    const { data: uploadResult } = await axios_1.default.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content,
    });
    const restaurant = await Restaurant_1.default.create({
        name,
        description,
        phone: Number(phone),
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress: formattedaddress,
        },
        isVerified: false,
        isOpen: false,
    });
    return res.status(201).json({
        message: "Restaurant created successfully",
        restaurant,
    });
});
exports.fetchMyRestaurant = (0, trycatch_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const restaurant = await Restaurant_1.default.findOne({ ownerId: user._id });
    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found"
        });
    }
    if (!user.restaurantId) {
        const token = jsonwebtoken_1.default.sign({
            user: {
                ...req.user,
                restaurantId: restaurant._id,
            },
        }, process.env.JWT_SEC, { expiresIn: "15d" });
        return res.json({
            restaurant,
            token
        });
    }
    return res.status(200).json({
        restaurant
    });
});
exports.updateStatusRestaurant = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login"
        });
    }
    const { status } = req.body;
    if (typeof status !== "boolean") {
        return res.status(400).json({
            message: "Status must be a boolean value",
        });
    }
    const restaurant = await Restaurant_1.default.findOneAndUpdate({ ownerId: req.user._id }, { isOpen: status }, { new: true });
    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found",
        });
    }
    return res.json({
        message: `Restaurant is now ${status ? "open" : "closed"}`,
        restaurant,
    });
});
exports.updateRestaurant = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login"
        });
    }
    const { name, description } = req.body;
    const restaurant = await Restaurant_1.default.findOneAndUpdate({ ownerId: req.user._id }, { name, description }, { new: true });
    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found",
        });
    }
    return res.json({
        message: "Restaurant updated successfully",
        restaurant,
    });
});
exports.getNearbyRestaurant = (0, trycatch_1.default)(async (req, res) => {
    const { latitude, longitude, radius = 5000, search = "" } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({
            message: "Latitude and Longitude are required",
        });
    }
    const query = {
        isVerified: true,
    };
    if (search && typeof search === "string") {
        query.name = { $regex: search, $options: "i" };
    }
    const restaurants = await Restaurant_1.default.aggregate([
        {
            $geoNear: {
                key: "autoLocation",
                near: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)]
                },
                distanceField: "distance",
                maxDistance: Number(radius),
                spherical: true,
                query
            },
        }, {
            $sort: {
                isOpen: -1,
                distance: 1,
            },
        },
        {
            $addFields: {
                distanceKm: {
                    $round: [{ $divide: ["$distance", 1000] }, 2],
                }
            }
        }
    ]);
    res.json({
        success: true,
        count: restaurants.length,
        restaurants,
    });
});
exports.fetchSingleRestaurant = (0, trycatch_1.default)(async (req, res) => {
    const restaurant = await Restaurant_1.default.findById(req.params.id);
    res.json({
        restaurant
    });
});

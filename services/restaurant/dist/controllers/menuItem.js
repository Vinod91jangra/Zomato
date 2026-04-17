"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMenuItemAvailablity = exports.deleteMenuItem = exports.getAllItems = exports.addMenuItem = void 0;
const axios_1 = __importDefault(require("axios"));
const datauri_1 = __importDefault(require("../config/datauri"));
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const Restaurant_1 = __importDefault(require("../model/Restaurant"));
const MenuItems_1 = __importDefault(require("../model/MenuItems"));
exports.addMenuItem = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login"
        });
    }
    const restaurant = await Restaurant_1.default.findOne({
        ownerId: req.user?._id
    });
    if (!restaurant) {
        return res.status(404).json({
            message: "No restaurant found"
        });
    }
    const { name, description, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({
            message: "name and price are required"
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
    const item = await MenuItems_1.default.create({
        name,
        description,
        price,
        restaurantId: restaurant._id,
        image: uploadResult.url,
    });
    res.json({
        message: "item added successfully",
        item
    });
});
exports.getAllItems = (0, trycatch_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            message: "Id is required"
        });
    }
    const items = await MenuItems_1.default.find({ restaurantId: id });
    res.json({
        items
    });
});
exports.deleteMenuItem = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login"
        });
    }
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required"
        });
    }
    const Item = await MenuItems_1.default.findById(itemId);
    if (!Item) {
        return res.status(404).json({
            message: "no item found"
        });
    }
    const restaurant = await Restaurant_1.default.findOne({
        _id: Item.restaurantId,
        ownerId: req.user._id,
    });
    if (!restaurant) {
        return res.status(404).json({
            message: "No Restaurant found with this id"
        });
    }
    await Item.deleteOne();
    res.json({
        message: "Menu item Deleted Successfully"
    });
});
exports.toggleMenuItemAvailablity = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login"
        });
    }
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required"
        });
    }
    const Item = await MenuItems_1.default.findById(itemId);
    if (!Item) {
        return res.status(404).json({
            message: "no item found"
        });
    }
    const restaurant = await Restaurant_1.default.findOne({
        _id: Item.restaurantId,
        ownerId: req.user._id,
    });
    if (!restaurant) {
        return res.status(404).json({
            message: "No Restaurant found with this id"
        });
    }
    Item.isAvailable = !Item.isAvailable;
    await Item.save();
    res.json({
        message: `Item Marked as ${Item.isAvailable ? "available" : "unavailable"}`,
    });
});

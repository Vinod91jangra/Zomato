import mongoose from "mongoose";
import TryCatch from "../middlewares/trycatch";
import cart from "../model/Cart.js";
export const addToCart = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login"
        });
    }
    const userId = req.user._id;
    const { restaurantId, itemId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message: "Invalid restaurantId or itemId"
        });
    }
    const cartFromDifferentRestaurant = await cart.findOne({ userId, restaurantId: { $ne: restaurantId } });
    if (cartFromDifferentRestaurant) {
        return res.status(400).json({
            message: "You have items from different restaurant in your cart. Please clear your cart before adding items from another restaurant."
        });
    }
    const cartItem = await cart.findOneAndUpdate({ userId, restaurantId, itemId }, { $inc: { quantity: 1 },
        $setOnInsert: { userId, restaurantId, itemId } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    return res.status(200).json({
        message: "Item added to cart",
        cartItem,
    });
});
export const fetchCartItems = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login"
        });
    }
    const userId = req.user._id;
    const cartItems = await cart.find({ userId }).populate("itemId").populate("restaurantId");
    let subtotal = 0;
    let cartLength = 0;
    for (const item of cartItems) {
        subtotal += item.quantity * item.itemId.price;
        cartLength += item.quantity;
    }
    return res.status(200).json({
        message: "Cart items fetched successfully",
        cartItems,
        subtotal,
        cartLength
    });
});
export const clearCart = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login"
        });
    }
    const userId = req.user._id;
    await cart.deleteMany({ userId });
    return res.status(200).json({
        message: "Cart cleared successfully",
    });
});
export const incrementCartItem = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Missing userId or itemId"
        });
    }
    const cartItem = await cart.findOneAndUpdate({
        userId, itemId
    }, {
        $inc: { quantity: 1 }
    }, {
        new: true
    });
    if (!cartItem) {
        return res.status(404).json({
            message: "Cart item not found"
        });
    }
    res.json({
        message: "Cart item quantity incremented",
        cartItem
    });
});
export const decrementCartItem = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Missing userId or itemId"
        });
    }
    const cartItem = await cart.findOne({
        userId, itemId
    });
    if (!cartItem) {
        return res.status(404).json({
            message: "Cart item not found"
        });
    }
    if (cartItem.quantity <= 1) {
        await cart.deleteOne({
            userId, itemId
        });
        res.json({
            message: "Cart item removed from cart",
        });
    }
    cartItem.quantity -= 1;
    await cartItem.save();
    res.json({
        message: "Cart item quantity decremented",
        cartItem
    });
});

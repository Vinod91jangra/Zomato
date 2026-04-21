import axios from "axios";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../model/Address.js";
import Cart from "../model/Cart.js";
import Order from "../model/Order.js";
import Restaurant from "../model/Restaurant.js";
export const createOrder = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const { paymentMethod, addressId } = req.body;
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return +(R * c).toFixed(2); // Distance in km
    };
    if (!addressId) {
        return res.status(400).json({
            message: "Adddress is required",
        });
    }
    const address = await Address.findOne({
        _id: addressId,
        userId: user._id
    });
    if (!address) {
        return res.status(404).json({
            message: "No address Found of user",
        });
    }
    const cartItems = await Cart.find({
        userId: user._id
    }).populate("itemId").populate("restaurantId");
    if (cartItems.length === 0) {
        return res.status(404).json({
            message: "No items found in Cart",
        });
    }
    const firstCartItem = cartItems[0];
    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res.status(401).json({
            message: "Invalid Cart Data",
        });
    }
    const restaurantId = firstCartItem.restaurantId._id;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({
            message: "No restaurant with this item id"
        });
    }
    if (!restaurant.isOpen) {
        return res.status(404).json({
            message: "Restaurant is closed for now"
        });
    }
    const distance = getDistance(address.location.coordinates[1], address.location.coordinates[0], restaurant.autoLocation.coordinates[1], restaurant.autoLocation.coordinates[0]);
    let subtotal = 0;
    const orderItems = cartItems.map((cart) => {
        const item = cart.itemId;
        if (!item) {
            throw new Error("Invalid Cart Item");
        }
        const itemTotal = item.price * cart.quantity;
        subtotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cart.quantity
        };
    });
    const deliveryFee = (subtotal < 250) ? 49 : 0;
    const platformFee = 7;
    const totalAmount = subtotal + deliveryFee + platformFee;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [longitude, latitude] = address.location.coordinates;
    const riderAmount = Math.ceil(distance) * 17;
    const order = await Order.create({
        userId: user._id.toString(),
        restaurantId: restaurantId.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        distance,
        riderAmount,
        items: orderItems,
        subtotal,
        deliveryFee,
        platformFee,
        totalAmount,
        addressId: address._id.toString(),
        deliveryAddress: {
            formattedAddress: address.formattedAddress,
            mobile: address.mobile,
            latitude,
            longitude
        },
        paymentMethod,
        paymentStatus: "pending",
        status: "placed",
        expiresAt,
    });
    await Cart.deleteMany({
        userId: user._id
    });
    res.json({
        message: "Order Created successfully",
        orderId: order._id.toString(),
        amount: totalAmount
    });
    // Emit real-time event for new order
    try {
        await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: "order:new",
            room: `restaurant:${restaurantId}`,
            payload: {
                orderId: order._id,
                status: order.status,
            },
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            }
        });
    }
    catch (error) {
        console.error("Failed to emit order event:", error);
    }
});
export const fetchOrderForPayment = TryCatch(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: "Forbidden"
        });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }
    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            message: "Order already Paid",
        });
    }
    res.json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "INR"
    });
});
export const fetchRestaurantOrders = TryCatch(async (req, res) => {
    const user = req.user;
    const { restaurantId } = req.params;
    if (!user) {
        return res.status(400).json({
            message: "unAuthorized",
        });
    }
    if (!restaurantId) {
        return res.status(400).json({
            message: "Restaurant id is required",
        });
    }
    const limit = req.query.limit ? Number(req.query.limit) : 0;
    const orders = await Order.find({ restaurantId, paymentStatus: "paid" })
        .sort({ createdAt: -1 })
        .limit(limit);
    return res.json({
        success: true,
        count: orders.length,
        orders,
    });
});
const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"];
export const updateOrderStatus = TryCatch(async (req, res) => {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;
    if (!user) {
        return res.status(400).json({
            message: "unAuthorized",
        });
    }
    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(400).json({
            message: "Order not found",
        });
    }
    if (order.paymentStatus !== "paid") {
        return res.status(400).json({
            message: "Not paid for Order",
        });
    }
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) {
        return res.status(400).json({
            message: "Restaurant not found",
        });
    }
    if (restaurant.ownerId !== user._id.toString()) {
        return res.status(401).json({
            message: "Only Owner is allowed to update this order",
        });
    }
    order.status = status;
    await order.save();
    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, { event: "order:update",
        room: `user:${order.userId}`,
        payload: {
            orderId: order._id,
            status: order.status,
        },
    }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        }
    });
    // Emit to restaurant as well
    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, { event: "order:update",
        room: `restaurant:${restaurant._id}`,
        payload: {
            orderId: order._id,
            status: order.status,
        },
    }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        }
    });
    //now assign riders 
    res.json({
        message: "order status Updated Successfully",
        order,
    });
});
export const getMyOrders = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(400).json({
            message: "unAuthorized",
        });
    }
    const orders = await Order.find({
        userId: req.user._id.toString(),
        paymentStatus: "paid"
    }).sort({ createdAt: -1 });
    res.json({ orders });
});
export const fetchSingleOrder = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "unAuthorized",
        });
    }
    const order = await Order.findById(req.params.id).sort({ createdAt: -1 });
    if (!order) {
        return res.status(404).json({
            message: "Order not Found",
        });
    }
    if (order.userId !== req.user._id.toString()) {
        return res.status(401).json({
            message: "You are not allowed to view this order"
        });
    }
    res.json({ order });
});

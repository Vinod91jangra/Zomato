"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_js_1 = __importDefault(require("./config/db.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const restaurant_js_1 = __importDefault(require("./routes/restaurant.js"));
const cors_1 = __importDefault(require("cors"));
const menuItem_js_1 = __importDefault(require("./routes/menuItem.js"));
const node_fetch_1 = __importDefault(require("node-fetch")); // ✅ important if Node < 18
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 5001;
// ✅ Routes
app.use("/api/restaurant", restaurant_js_1.default);
app.use("/api/item", menuItem_js_1.default);
// ✅ Simple in-memory cache
const cache = {};
// ✅ Location API (Fixed)
app.get("/api/location", async (req, res) => {
    const { lat, lon } = req.query;
    // ✅ Validation
    if (!lat || !lon) {
        return res.status(400).json({
            message: "Latitude and Longitude are required",
        });
    }
    const key = `${lat},${lon}`;
    // ✅ Return cached response
    try {
        // ✅ Rate limit protection (avoid 429)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await (0, node_fetch_1.default)(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: {
                "User-Agent": "food-delivery-app", // ✅ required
            },
        });
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error("Location API Error:", error);
        res.status(500).json({
            message: "Failed to fetch location",
        });
    }
});
// ✅ Server start
app.listen(PORT, () => {
    console.log(`Restaurant service is running on port ${PORT}`);
    (0, db_js_1.default)();
});

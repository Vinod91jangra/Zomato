import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import restaurantRoutes from "./routes/restaurant.js";
import cors from "cors";
import itemRoutes from "./routes/menuItem.js";
import fetch from "node-fetch"; // 
import cartRoutes from "./routes/CartItem.js"; 
import addressRoute from "./routes/Address.js"
import orderRoutes from "./routes/Order.js"
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";
dotenv.config();

const startServer = async () => {
  await connectRabbitMQ();
  startPaymentConsumer();

  // start express server here also
};

startServer();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// ✅ Routes
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/cart", cartRoutes); 
app.use("/api/address",addressRoute);
app.use("/api/order",orderRoutes);

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

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "food-delivery-app", // ✅ required
        },
      }
    );

    const data = await response.json();

  

    res.json(data);
  } catch (error) {
    console.error("Location API Error:", error);
    res.status(500).json({
      message: "Failed to fetch location",
    });
  }
});

// ✅ Server start
app.listen(PORT, () => {
  console.log(`Restaurant service is running on port ${PORT}`);
  connectDB();
});
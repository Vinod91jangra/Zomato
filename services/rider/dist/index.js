import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();
// const startServer = async () => {
//   await connectRabbitMQ();
//   startPaymentConsumer();
//   // start express server here also
// };
//startServer();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5005;
// ✅ Server start
app.listen(PORT, () => {
    console.log(`Rider service is running on port ${PORT}`);
    connectDB();
});

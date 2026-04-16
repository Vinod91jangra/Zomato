import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cloudinaryRoutes from "./routes/cloudinary.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET, PORT } = process.env;
if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
    console.error("Missing Cloudinary env vars: CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET");
    process.exit(1);
}

cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET,
});

app.use("/api", cloudinaryRoutes);

const port = PORT ? Number(PORT) : 5002;
app.listen(port, () => {
    console.log(`Utils service is running on port ${port}`);
});

import express from "express";
import cloudinary from "cloudinary";
const router = express.Router();
router.post("/upload", async (req, res) => {
    try {
        const { buffer } = req.body;
        if (!buffer) {
            return res.status(400).json({ message: "Buffer is required" });
        }
        // Upload the data URI buffer to Cloudinary
        const cloud = await cloudinary.v2.uploader.upload(buffer, {
            resource_type: "auto" // Auto-detect resource type (image, video, etc.)
        });
        res.json({
            url: cloud.secure_url,
        });
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ message: error.message || "Upload failed" });
    }
});
export default router;

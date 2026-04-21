import express from "express";
import { addAddress, deleteAddress, getAddresses } from "../controllers/Address";
import { isAuth } from "../middlewares/isAuth";
const router = express.Router();
router.post("/add", isAuth, addAddress);
router.get("/all", isAuth, getAddresses);
router.delete("/:id", isAuth, deleteAddress);
export default router;

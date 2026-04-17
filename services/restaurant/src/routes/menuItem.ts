

import express from "express"
import { isAuth, isSeller } from "../middlewares/isAuth";
import { addMenuItem, deleteMenuItem, getAllItems, toggleMenuItemAvailablity } from "../controllers/menuItem";
import uploadFile from "../middlewares/multer";

const router  = express.Router();

router.post("/new",isAuth,isSeller,uploadFile,addMenuItem);
router.get("/all/:id",isAuth,getAllItems);
router.delete("/:itemId",isAuth,isSeller,deleteMenuItem);
router.put("/status/:itemId",isAuth,isSeller,toggleMenuItemAvailablity);
export default router
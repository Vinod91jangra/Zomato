
import express from "express"
import {addToCart, decrementCartItem, fetchCartItems, incrementCartItem,clearCart} from "../controllers/Cart.js"
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/add",isAuth,addToCart)
router.get("/all",isAuth,fetchCartItems)
router.delete("/clear",isAuth,clearCart)
router.put("/inc",isAuth,incrementCartItem)
router.put("/dec",isAuth,decrementCartItem)

export default router;
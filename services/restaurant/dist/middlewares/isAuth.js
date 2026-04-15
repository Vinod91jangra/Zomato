"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please Login - No auth header"
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login - token Missing"
            });
            return;
        }
        const decodedValue = jsonwebtoken_1.default.verify(token, process.env.JWT_SEC);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Invalid Token",
            });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};
exports.isAuth = isAuth;

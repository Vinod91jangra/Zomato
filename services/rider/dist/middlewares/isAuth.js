import jwt from 'jsonwebtoken';
export const isAuth = async (req, res, next) => {
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
        const decodedValue = jwt.verify(token, process.env.JWT_SEC);
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
export const isSeller = async (req, res, next) => {
    const user = req.user;
    if (user?.role !== "seller") {
        res.status(401).json({
            message: "Access Denied - Sellers Only"
        });
        return;
    }
    next();
};

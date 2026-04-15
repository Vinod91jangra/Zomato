import { Request,Response,NextFunction} from "express"
import jwt,{JwtPayload} from 'jsonwebtoken'


export interface IUser {
    _id:string;
    name:string;
    email:string;
    image:string;
    role: string;
}


export interface AuthenticatedRequest extends Request{
    user?: IUser | null; 
}

export const isAuth = async(req:AuthenticatedRequest,res:Response,next:NextFunction):
Promise<void> => {
    try {
        const authHeader = req.headers.authorization

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message:"Please Login - No auth header"
            })
            return;
        }

        const token = authHeader.split(" ")[1];
        if(!token){
            res.status(401).json({
                message:"Please Login - token Missing"
            })
            return;
        }

        const decodedValue = jwt.verify(
            token,
            process.env.JWT_SEC as string) as JwtPayload;

            if(!decodedValue || !decodedValue.user){
                res.status(401).json({
                    message:"Invalid Token",
                });
                return;
            }
            req.user = decodedValue.user;
            next();
    } catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({
            message:"Invalid or expired token"
        })
    }
}
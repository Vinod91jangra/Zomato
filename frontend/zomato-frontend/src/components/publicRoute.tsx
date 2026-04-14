
import {Navigate,Outlet} from "react-router-dom";
import { useAppData } from "../context/Appcontext";

const PublicRoute = () => {
    const {isAuth,loading} = useAppData();
    if(loading){
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    return isAuth ? <Navigate to="/" /> : <Outlet />

}
export default PublicRoute;
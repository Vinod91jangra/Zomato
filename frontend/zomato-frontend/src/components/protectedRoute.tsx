import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/Appcontext"

const ProtectedRoute = () =>{

    const {isAuth,user,loading} = useAppData();
      const location = useLocation();
    if(loading){
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
      
        if(!isAuth){
            return <Navigate to="/login" replace />;

        }
    if (user?.role === null && location.pathname !== "/select-role") {
        return <Navigate to="/select-role" replace />;
    }
    // if (user?.role && location.pathname === "/select-role") {
    //     return <Navigate to="/" replace />;
    // }
    if(user?.role === "seller" && location.pathname !== "/"){
        return <Navigate to="/" replace />
     }
    return <Outlet />
}

export default ProtectedRoute;

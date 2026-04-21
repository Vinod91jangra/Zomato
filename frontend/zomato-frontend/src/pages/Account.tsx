import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/Appcontext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";
import Orders from "./Orders";


const Account = () => {
    const {user,setUser,setIsAuth} = useAppData();

    const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "";

    const Navigate = useNavigate();

    const logoutHandler = () =>{
        localStorage.setItem("token","");
        setUser(null);
        setIsAuth(false);
        Navigate("/login");

        toast.success("Logged out successfully");
    }
    
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
          <div className="  mx-auto max-w-md rounder-lg bg-white shadow-sm">
            <div className="flex items-center justify-center gap-4 border-b p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full
              bg-red-500 text-xl font-semibold text-white">
                {firstLetter}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user?.name} </h2>
                <p className="text-sm text-gray-500">{user?.email} </p>
              </div>
              <div className="divide-y">
                <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" 
                onClick={() => Navigate("/order")}>
              <BiPackage className="h-5 w-5 text-red-500"/>
                <span className="font-medium">Orders</span>
                
                </div>

                <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" 
                onClick={() => Navigate("/addresses")}>
              <BiMapPin className="h-5 w-5 text-red-500"/>
                <span className="font-medium">Addresses</span>
                
                </div>

                <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" 
                onClick={logoutHandler}>
              <BiLogOut className="h-5 w-5 text-red-500"/>
                <span className="font-medium">Logout</span>
                
                </div>

              </div>
            </div>
          </div>
    </div>
  )
}

export default Account



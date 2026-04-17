import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import axios from "axios";
import type { LocationData, AppContextType, User } from "../types";
import { Toaster } from "react-hot-toast";



export const AppContext = createContext<AppContextType | undefined>(undefined) 

interface AppProviderProps{
    children :ReactNode;
}

export const AppProvider = ({children}  : AppProviderProps) => {
    const [user,setUser] = useState<User | null>(null);
    const[isAuth,setIsAuth] = useState(false);
    const[loading,setLoading] = useState(true);

    const[location,setLocation] = useState<LocationData | null>(null);
    const [loadinglocation, setLoadinglocation] = useState(false);
    const[city,setCity] = useState("Fetching Location.....");

    async function fetchUser(){
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const {data} = await axios.get(`${authService}/api/auth/me`,{
                headers:{
                    Authorization:`Bearer ${token}`,
                },

            })
            
                setUser(data);
                setIsAuth(true);
                
        } catch (error: any) {
            console.log(error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                setIsAuth(false);
                setUser(null);
            }
        }
        finally{
            setLoading(false);
        }
    }
useEffect(() =>{
    fetchUser();
},[])

useEffect(() => {
  if (!navigator.geolocation) {
    alert("Please Allow Location Access");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `http://localhost:5001/api/location?lat=${latitude}&lon=${longitude}`
        );

        const data = await res.json();

        setLocation({
          latitude,
          longitude,
          formattedAddress: data?.display_name || "Current Location",
        });

        setCity(
          data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            "Your Location"
        );
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          formattedAddress: "Current Location",
        });

        setCity("Your Location");
      }
    },
    () => {
      alert("Location permission denied");
    }
  );
}, []);
return <AppContext.Provider value = {{isAuth,loading,setIsAuth,setLoading,setUser,user,location,city,loadinglocation}}>
    {children}
    <Toaster/>
    </AppContext.Provider>
}


export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if(!context){
        throw new Error("useAppData must be used within AppProvider");
        
    }
    return context;
}


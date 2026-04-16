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

useEffect(() =>{
    if(!navigator.geolocation)
      return  alert("Geolocation is not supported by your browser.");
    setLoadinglocation(true);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Use a free geocoding service that works with CORS
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await res.json();

                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || "current location",
                });
                setCity(
                    data.city ||
                    data.locality ||
                    data.localityInfo?.administrative?.[2]?.name ||
                    "Your location"
                );
                setLoadinglocation(false);
            } catch (error) {
                console.error("BigDataCloud failed, trying fallback...");
                try {
                    // Fallback to ipapi.co for basic location info
                    const fallbackRes = await fetch('https://ipapi.co/json/');
                    const fallbackData = await fallbackRes.json();

                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: `${fallbackData.city}, ${fallbackData.region}`,
                    });
                    setCity(fallbackData.city || "Your location");
                    setLoadinglocation(false);
                } catch (fallbackError) {
                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: "current location",
                    });
                    setCity("Failed to Load");
                    setLoadinglocation(false);
                    console.error("Location reverse-geocode error:", error, fallbackError);
                }
            }
});
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


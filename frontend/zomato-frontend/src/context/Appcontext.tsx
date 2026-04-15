import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import axios from "axios";
import type { LocationData, AppContextType, User } from "../types";



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
    if(!navigator.geolocation){ return alert("Please allow Location to continue");}
    setLoadinglocation(true);

    navigator.geolocation.getCurrentPosition(async (position)=>{

        const {latitude,longitude} = position.coords;
        try {
           
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();

            setLocation({
                latitude,
                longitude,
                formattedAddress: data.display_name || "current location"
            })
            setCity(
                data.address.city ||
                 data.address.town ||
                  data.address.village 
                  || "Your location"
            )
        } catch (error) {
            setLoadinglocation(false);
        }
    });
});
return <AppContext.Provider value = {{isAuth,loading,setIsAuth,setLoading,setUser,user,location,city,loadinglocation}}>
    {children}
    </AppContext.Provider>
}


export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if(!context){
        throw new Error("useAppData must be used within AppProvider");
        
    }
    return context;
}


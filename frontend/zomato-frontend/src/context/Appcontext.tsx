import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import axios from "axios";
import type { AppContextType, User } from "../types";

export const AppContext = createContext<AppContextType | undefined>(undefined) 

interface AppProviderProps{
    children :ReactNode;
}

export const AppProvider = ({children}  : AppProviderProps) => {
    const [user,setUser] = useState<User | null>(null);
    const[isAuth,setIsAuth] = useState(false);
    const[loading,setLoading] = useState(true);

    const[location,setLocation] = useState(null);
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
            
                setUser(data.user);
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

return <AppContext.Provider value = {{isAuth,loading,setIsAuth,setLoading,setUser,user}}>
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
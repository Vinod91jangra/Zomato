import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";

import AddRestaurant from "./AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";

type SellerTab = "menu" | "add-item" | "sales";
export const Restaurant = () => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [Tab, setTab] = useState<SellerTab>("menu");

      
    const fetchMyRestaurant = async () => {
        try {
            const response = await axios.get(
                `${restaurantService}/api/restaurant/my`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const data = response.data;
            setRestaurant(data.restaurant || null);

            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRestaurant();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Loading Your Restaurant...</p>
            </div>
        );
    }

    if (!restaurant) {
        return <AddRestaurant  fetchMyRestaurant={fetchMyRestaurant}/>;
    }

    return (
        <div className="flex flex-col">
            <RestaurantProfile restaurant={restaurant} isSeller={true} onUpdate={setRestaurant}/>
    <div className="flex border-b rounded-t-2xl shadow-sm  mx-3 my-3 ">
           {
            [
                {key:"menu",label:"Menu Items"},
                {key:"add-item",label:"Add New Item"},
                {key:"sales",label:"Sales Report"},
            ].map((tab) => (
                <button key = {tab.key} onClick={() => setTab(tab.key as SellerTab)}
             className={`flex-1 py-3 text-sm font-medium transition ${Tab===tab.key?
              'text-red-500 border-b-2 border-red-500' 
              : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab.label}
                </button>
            ))
           }
    </div>
    <div className="p-5 rounded-b-2xl ml-3  mr-3 shadow-sm">
        {Tab === "menu" && <p>Menu Page</p>}
        {Tab === "add-item" && <p>Add Item Page</p>}
        {Tab === "sales" && <p>Sales Report Page</p>}
    </div>
        </div>
    );
};

export default Restaurant;



import { useState } from "react";
import type {IRestaurant}  from "../types"
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiSave,BiMapPin } from "react-icons/bi";

interface props{
    restaurant: IRestaurant;
    isSeller: boolean;
    onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({restaurant,isSeller,onUpdate}: props)=>{
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(restaurant.name);
    const [description, setDescription] = useState(restaurant.description);
    const [isOpen, setIsOpen] = useState(restaurant.isOpen);
    const[loading, setLoading] = useState(false);
    

    const toggleOpenStatus = async()=>{
        try{
            const {data} = await axios.put(`${restaurantService}/api/restaurant/status`,
                {status: !isOpen},
                {
                    headers:{
                        Authorization:`Bearer ${localStorage.getItem("token")}`,
                    }
                }
            );
            toast.success(`Restaurant is now ${data.restaurant.isOpen? "Open":"Closed"}`);
            setIsOpen(data.restaurant.isOpen);
        }
        catch(error: any){
            console.log(error)
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const saveChanges = async() =>{
        try {
            setLoading(true);
            const{data} = await axios.put(`${restaurantService}/api/restaurant/edit`,
           {
            name,description
           },{
            headers:{
                Authorization:`Bearer ${localStorage.getItem("token")}`,
            }
           }
            
            );
            
            toast.success("Restaurant updated successfully");
            onUpdate(data.restaurant);
            setEditMode(false);
        } catch (error: any) {
            console.log(error)
            toast.error(error.response?.data?.message || "Failed to update restaurant");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="mx-auto max-w-xl rounded-xl bg-white shadow-sm overflow-hidden"> 
         {
            restaurant.image && ( <img src={restaurant.image} alt={restaurant.name} 
            className="h-64 w-full object-cover"/>)
         }  
         <div className="p-5 space-y-4">
        {
           isSeller && <div className="flex justify-between items-start">
              <div>
                {
                    editMode ? (
                        <input type="text" value={name} onChange={e =>setName(e.target.value) }
                            className = "w-full rounded border px-2 py-1 text-lg font-semibold"/>
                    ) : (
                        <h2 className="text-2xl font-bold">{restaurant.name}</h2>   
                        )
                }
                <div  className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <BiMapPin className="h-4 w-4 text-red-500"/>
                    {restaurant.autoLocation?.formattedAddress || "Location not available"}
                </div>
              </div>
              <button onClick={() => setEditMode(!editMode)} className="text-gray-500 text-black">
                <BiEdit size={18}/>
              </button>
            </div>
                   }
            {
                editMode? (<textarea value = {description} onChange={e =>setDescription(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"/>):(
                    <p className="text-gray-600 text-sm">{restaurant.description || "No description added"}</p>
                )
            }
           <div className="flex items-center justify-between pt-3 border-t">
            <span className={`text-sm font-medium ${isOpen? "text-green-600":"text-red-500"}`}>
                {isOpen? "Open Now" : "Closed"}
            </span>
            <div className="flex gap-3">
                {
                    editMode && <button onClick={saveChanges} disabled={loading} 
                    className="bg-blue-500 flex justify-center items-center text-white  px-4 py-4 rounded hover:bg-blue-600">
                      <BiSave />
                      <div>Save</div> 
                    </button>
                }
                {
            isSeller && <button onClick = {toggleOpenStatus} 
            className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white
                ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}  >
                    {isOpen? "Close Restaurant" : "Open Restaurant"}</button>
                }
            </div>
           </div>
           <p className="text-xs text-gray-400">Created on_
            { new Date(restaurant.createdAt).toLocaleDateString()}</p>
        </div>
        </div>
    )
}
export default RestaurantProfile;
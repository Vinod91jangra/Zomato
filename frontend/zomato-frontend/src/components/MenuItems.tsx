import React, { useState } from 'react'
import type { IMenuItem } from '../types';
import { BsCart, BsEye } from 'react-icons/bs';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { BiTrash } from 'react-icons/bi';
import toast, { LoaderIcon } from 'react-hot-toast';
import { VscLoading } from 'react-icons/vsc';
import { restaurantService } from '../main';
import axios from 'axios';

interface MenuItemsProps{
    items:IMenuItem[];
    onItemDeleted:() => void;
    isSeller:boolean;
}

     const MenuItems = ({items,onItemDeleted,isSeller}: MenuItemsProps) => {
     const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    

     const handleDeleteItem = async(itemId:string) =>{
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if(!confirm) return;
    try {
        setLoadingItemId(itemId);
        await axios.delete(`${restaurantService}/api/item/${itemId}`,
            {
                headers:
                {
                  Authorization:`Bearer ${localStorage.getItem("token")}`,
                }}
        );
               toast.success("Item deleted successfully");
               onItemDeleted();

     }
     catch(error){
           console.log(error)
           toast.error("Failed to delete item");
     }
    }

     const toggleAvailability = async(itemId:string) =>{
    const confirm = window.confirm("Are you sure you want to toggle this item's availability?");
    if(!confirm) return;
    try {
        setLoadingItemId(itemId);
      const {data} =  await axios.put(`${restaurantService}/api/item/status/${itemId}`,
            {},
            {
                headers:
                {
                  Authorization:`Bearer ${localStorage.getItem("token")}`,
                }}
        );
               toast.success(data.message);
              onItemDeleted();
               setLoadingItemId(null);

     }
     catch(error){
           console.log(error)
           toast.error("Failed to update item availability");
           
     }
            finally{
               setLoadingItemId(null);
            }

     }
     
 return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            key={item._id}
            className={`relative flex gap-4 rounded-lg bg-white p-4 shadow-sm transition 
              ${!item.isAvailable ? "opacity-70" : ""}`}
          >
            <div className="relative shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className={`h-20 w-20 rounded object-cover 
                  ${!item.isAvailable ? "grayscale brightness-75" : ""}`}
              />
              {
                !item.isAvailable && (
                <span className="absolute inset-0 flex items-center justify-center
                 bg-black bg-opacity-50 text-white">Not Available</span>

              )}

            </div>
          <div className='flex flex-1 flex-col justify-between'  >
            <div>
                <h3 className='font-semibold'>{item.name}</h3>
                {
                    item.description &&
                     <p className='text-sm line-clamp-2 text-gray-500'>{item.description}</p>
                }
            </div>
            <div className='flex items-center justify-between gap-4'>
              <p className='font-medium'>₹{item.price}</p>
              {
                isSeller && <div className='flex gap-2'>
                  <button onClick={() => toggleAvailability(item._id)} className='roudned-lg p-2 text-gray-600
                  hover:bg-gray-100'>{
                    item.isAvailable? <BsEye size={18}/> : <FiEyeOff size={18}/> 

                  }</button>
                  <button onClick={() => handleDeleteItem(item._id)} className='rouded-lg p-2 text-red-500 hover:bg-red-50'>
                    <BiTrash size={18}/>
                  </button>
                </div>
              }
              {
                !isSeller && <button disabled={!item.isAvailable || isLoading}
                onClick={() => {}} className={`rounded-lg p-2 flex items-center 
                justify-center ${
                !item.isAvailable || isLoading ? "cursor-not-allowed text-gray-400"
                : "text-red-500 hover:bg-red-50"
                }`}>
                  {
                    isLoading ? <VscLoading size={18} className='animate-spin'/>: 
                    <BsCart size={18}/>
                  }
                </button>
              }
            </div>
          </div>
          </div>
        );
      })}
    </div>
  );
}



export default MenuItems

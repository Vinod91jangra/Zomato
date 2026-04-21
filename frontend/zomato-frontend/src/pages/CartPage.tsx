import React, { useState } from 'react'
import { useAppData } from '../context/Appcontext';
import { useNavigate } from 'react-router';
import type { ICart, IMenuItem, IRestaurant } from '../types';
import { restaurantService } from '../main';
import axios from 'axios';
import toast from 'react-hot-toast';
import { VscLoading } from 'react-icons/vsc';
import { BiMinus, BiPlus } from 'react-icons/bi';
import { TbTrash } from 'react-icons/tb';

const CartPage = () => {

  const { cart ,subTotal,quantity,fetchCart} = useAppData();
  const navigate = useNavigate();
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);
  const {location }= useAppData()

  if(!cart || cart.length === 0){
    return(
    <div className='flex min-h-[60vh] items-center justify-center'>
      <p className='text-gray-500 text-lg'>Your cart is empty</p>
    </div>)
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;

  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQuantity = async(itemId :string) =>{
    try {
      setLoadingItemId(itemId);
      await axios.put(`${restaurantService}/api/cart/inc`,
        {itemId},
      {  headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`}}
          );
          await fetchCart();
    }

      catch(error){
       toast.error("Failed to increase cart item quantity");
      }
      finally{
        setLoadingItemId(null);
      }
    }
      const decreaseQuantity = async(itemId :string) =>{
    try {
      setLoadingItemId(itemId);
      await axios.put(`${restaurantService}/api/cart/dec`,
        {itemId},
      {  headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`}}
          );
          await fetchCart();
    }

      catch(error){
       toast.error("Failed to decrease cart item quantity");
      }
      finally{
        setLoadingItemId(null);
      }

    }
        const clearCart = async() =>{
          const confirm =  window.confirm("Are you sure you want to clear the cart?");
          if(!confirm) return;
    try {

      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`,
      {  headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`}}
          );
          await fetchCart();
    }

      catch(error){
       toast.error("Failed to clear cart");
      }
      finally{
        setClearingCart(false);
      }
    }

      const Oncheckout = () =>{
        navigate("/checkout");
      }
      

    
  return (
    <div className='mx-auto  px-4 py-6 space-y-6'>
      <div className='rounded-xl  bg-white p-4 shadow-sm'>
        <h2 className='text-xl font-semibold '>{restaurant.name}</h2>
        <p className='text-sm text-gray-500'>{location?.formattedAddress|| "Address not available"}</p>
      </div>
           
           <div className='space-y-4 '>
            {cart.map((cartItem: ICart)=>{
              const item =  cartItem.itemId as IMenuItem;
              const isLoading = loadingItemId === item._id;

              return( 
                <div key ={item._id} className='flex items-center gap-4 rounded-xl bg-white shadow-sm p-4'>
                  <img src={item.image} alt="img" className='h-20 w-20 rounded object-cover' />
                  <div className='flex-1'>
                    <h3 className='font-semibold'>{item.name}</h3>
                    <p className='text-sm text-gray-500'>₹{item.price}</p>
                  </div>
                  
                  <div className='flex items-center gap-3 '>
                    <button className='rounded-full p-2 borded hover:bg-gray-100 disabled:opacity-50
                    ' onClick={()=>decreaseQuantity(item._id)}>{isLoading? <VscLoading  size={16} className='animate-spin'/>
                     : <BiMinus size={16}/>}</button>
                     <span className='text-lg font-bold'>{cartItem.quantity}</span>
                      <button className='rounded-full p-2 border hover:bg-gray-100 disabled:opacity-50
                    ' onClick={()=>increaseQuantity(item._id)}>{isLoading? <VscLoading  size={16} className='animate-spin'/>
                     : <BiPlus size={16}/>}</button>
                     <p className='w-20 text-right font-medium '>
                      ₹{item.price * cartItem.quantity}
                     </p>
                  </div>
                   </div>
              )
                
              } )
            }

            
            
           </div>
           <div className='rounded-xl bg-white p-4 shadow-sm space-y-3'>
            <div className='flex justify-between text-sm'>
              <span>Total Items</span>
              <span>{quantity}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>SubTotal</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>
             <div className='flex justify-between text-sm'>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0? "Free": `₹${deliveryFee.toFixed(2)}`}</span>
            </div>
             <div className='flex justify-between text-sm'>
              <span>PlatForm Fee</span>
              <span>₹{platformFee.toFixed(2)}</span>
              {
                subTotal<250 && <p className='text-xs text-gray-500'>
                  Add Item worth ₹{250 - subTotal} more to get free delivery</p>
              }
              </div>
              <div className='flex justify-between text-base font-semibold border-t pt-2 '>
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <button className={`mt-3 w-full rounded-lg bg-[#E23744] py-3 text-sm font-semibold
               text-white hover:bg-red-700 cursor-pointer ${!restaurant?.isOpen ? 'opacity-50 cursor-not-allowed' : ''}`} 
               disabled ={!restaurant?.isOpen} onClick={Oncheckout}>{restaurant?.isOpen ? "Proceed To Checkout" : "Restaurant Closed"}</button>
              <button
                className="mt-3 w-full rounded-l bg-gray-600 py-3 text-sm font-semibold 
                          text-white hover:bg-gray-700 flex items-center justify-center gap-2"
                onClick={clearCart}
                disabled={clearingCart}
                                            >
                {clearingCart ? (
                  <VscLoading size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Clear Cart</span>
                    <TbTrash size={18} />
                  </>
                )}
              </button>
            </div>
           </div>
    
  )
}



export default CartPage

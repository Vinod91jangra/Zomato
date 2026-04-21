import React, { useEffect, useState } from 'react'
import type { ICart, IOrder, IRestaurant } from '../types';
import { useAppData } from '../context/Appcontext';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { restaurantService } from '../main';
import axios from 'axios';


const OrderPage = () => {

  const {id} = useParams();
  const {socket} = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true)
  

  const fetchOrder = async()=>{
    try {
      if(!id) return;

      const {data} = await axios.get(`${restaurantService}/api/order/my/${id}`
        ,{
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`,
          }
        }
      )
      console.log(data)
      setOrder(data.order || null);
    } catch (error) {
      console.log(error)
    }
    finally{
      setLoading(false);
    }
  }
  useEffect(()=>{
    fetchOrder();
  },[id]);

  useEffect(() =>{
          if(!socket)return;
          const onOrderUpdate = () => {
              fetchOrder();
          }
          socket.on("order:update",onOrderUpdate);
             return () =>{
              socket.off("order:update",onOrderUpdate);
             }
          
      }, [socket]);
       if(loading){
        return <p className='text-center text-gray-500'>Loading orders...</p>}

         if(!order){
        return <div className='flex min-h-[60vh] items-center justify-center'>
            <p className="text-gray-500">Order not found</p>
        </div>
    }
  
  return (
    <div className='mx-auto max-w-3xl px-4 py-6 space-y-6'>
      <h1 className="text-xl font-bold">Order #{order._id}</h1>
      <div className="rounded-lg bg-blue-50 p-3 text-sm font-medium"
       >
        Status:  <span className='capitalize'>{order.status}</span>
       </div>
       <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-semibold">Items</h2>
        {
          order && order.items && order.items.map((item,i) =>(
            <div className="flex justify-between text-sm" key={i}>
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity)}</span>
            </div>
          ))
        }
        {(!order || !order.items || order.items.length === 0) && (
          <p className="text-gray-500 text-sm">No items found</p>
        )}
        <div className="rounded-xl bg-white p-4 shadow-sm space-y-1">
          <h2 className="font-semibold">Delivery Address</h2>
          {order?.deliveryAddress ? (
            <>
              <p className="text-sm text-gray-600">
                {order.deliveryAddress.formattedAddress}
              </p>
              <p className="text-sm text-gray-600">
                Mobile: {order.deliveryAddress.mobile}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Address not available</p>
          )}
        </div>
        <div className='rounded-xl bg-white p-4 shadow-sm space-y-2'>
            <div className='flex justify-between text-sm '>
          <span>SubTotal</span>
          <span>₹{order.subtotal.toFixed(2)}</span>
        </div>
        </div>
      

        <div className='rounded-xl bg-white p-4 shadow-sm space-y-2'>
           <div className='flex justify-between text-sm '>
          <span>Delivery Fee</span>
          <span>₹{order.deliveryFee.toFixed(2)}</span>
        </div>
        </div>
       

        <div className='rounded-xl bg-white p-4 shadow-sm space-y-2'>
          <div className='flex justify-between text-sm '>
          <span>Platform Fee</span>
          <span>₹{order.platformFee.toFixed(2)}</span>
        </div>
        </div>
        

        <div className='rounded-xl bg-white p-4 shadow-sm space-y-2'>
          <div className='flex justify-between text-sm '>
          <span>Total</span>
          <span>₹{order.totalAmount.toFixed(2)}</span>
        </div>
        </div>
        

        <p className="text-xs text-gray-500">Payment Method: {order.paymentMethod}</p>
        <p className="text-xs text-gray-500">Payment Status: {order.paymentStatus}</p>
       </div>
    </div>
  )
}

export default OrderPage


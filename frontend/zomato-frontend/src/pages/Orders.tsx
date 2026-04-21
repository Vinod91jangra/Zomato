import React, { use, useEffect, useState } from 'react'
import type { IOrder } from '../types';
import { data, useNavigate } from 'react-router';
import { restaurantService } from '../main';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
const ACTIVE_STATUSES =
 ["placed" , "accepted" ,"preparing","ready_for_rider", "rider_assigned", "picked_up" ];
const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    const {socket}  = useSocket();

    const fetchOrders = async () =>{
        try {
          const {data} = await axios.get(`${restaurantService}/api/order/myorder`,
            {
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`},  
            }
        );
        console.log(data.orders)
        setOrders(data.orders || []);
       
      } catch (error) {
        setLoading(false);
      }
      finally{
        setLoading(false);
      }

    }
    useEffect(() =>{
        fetchOrders();
    }, []);

    useEffect(() =>{
        if(!socket)return;
        const onOrderUpdate = () => {
            fetchOrders();
        }
        socket.on("order:update",onOrderUpdate);
           return () =>{
            socket.off("order:update",onOrderUpdate);
           }
        
    }, [socket]);
    if(loading){
        return <p className='text-center text-gray-500'>Loading orders...</p>
    }
    if(orders.length === 0){
        return <div className='flex min-h-[60vh] items-center justify-center'>
            <p className="text-gray-500">No orders yet</p>
        </div>
    }

     const active_orders = orders.filter((o) =>{
       return ACTIVE_STATUSES.includes(o.status)
    })
   
    const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));


  return (
    <div className='mx-auto max-w-4xl px-4 py-6 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>My Orders</h1>

        <section className='space-y-3'>
            <h2 className='text-lg font-semibold'>Acitve Orders</h2>

            {active_orders.length === 0 ? (
                <p className='text-gray-500'>No active orders</p>
            ) : (
                <div className='space-y-3'>
                    {active_orders.map((order) => (
                      <OrderRow key = {order._id}
                      order = {order}
                      onClick={()=> navigate(`/order/${order._id}`)}/>  
                    ))}
                </div>
            )}
        </section>
        <section className='space-y-3'>
            <h2 className='text-lg font-semibold'>Completed Orders</h2>

            {completedOrders.length === 0 ? (
                <p className='text-gray-500'>No completed orders</p>
            ) : (
                <div className='space-y-3'>
                    {completedOrders.map((order) => (
                      <OrderRow key = {order._id}
                      order = {order}
                      onClick={()=> navigate(`/order/${order._id}`)}/>  
                    ))}
                </div>
            )}
        </section>
     
    </div>
  )
}

export default Orders
const OrderRow = ({order,onClick}:{order:IOrder,onClick:() => void}) =>{
 return (<div onClick={onClick}
 className='flex flex-col   p-4 bg-white rounded-lg shadow-sm cursor-pointer'>
    <div className='flex justify-between items-center'>
        <p className='text-sm font-medium'>Order #{order._id.slice(-6)}</p>
        <p className='text-xs text-gray-400'>{order.status}</p>
    </div>
   
    <div className='mt-2 text-sm text-gray-600'>
        {order.items.map((item,i) =>(
            <span key={i}>{item.name} x {item.quantity}
            {i<order.items.length - 1 && ", "}</span>
        ))}
    </div>
    <div className='mt-2 flex justify-between text-sm font-medium'>
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
    </div>
    </div>)
}
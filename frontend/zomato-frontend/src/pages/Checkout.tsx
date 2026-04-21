import  { useEffect, useState } from 'react'
import { useAppData } from '../context/Appcontext'
import axios from 'axios';
import { useNavigate } from 'react-router';
import type { ICart, IMenuItem, IRestaurant } from '../types';
import toast from 'react-hot-toast';
import { utilsService } from '../main';
import { loadStripe } from '@stripe/stripe-js';

import { BiCreditCard, BiLoader } from 'react-icons/bi';

interface Address {
  _id:string,
  formattedAddress:string,
  mobile:number
}

const Checkout = () => {
  const {cart,subTotal,quantity,} = useAppData();


  const [addresses,setAddresses] = useState<Address[]>([])
  const [selectedAddress, setselectedAddress] = useState<string | null>(null);
const [loadingAddress, setLoadingAddress] = useState(true)
  const [loadingRazorpay, setLoadingRazorpay] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState(false)
  
    const navigate = useNavigate();

  useEffect(() =>{
    const fetchAddresses = async() =>{
      if(!cart || cart.length === 0){
          console.log("fettcing")
        setLoadingAddress(false);return;
      }
         try {
        
          setLoadingAddress(true);
          const {data}= await axios.get(`http://localhost:5001/api/address/all`,{
            headers:{
              Authorization:`Bearer ${localStorage.getItem("token")}`,
            }
          });
          setAddresses(data );
          console.log(data);
         } catch (error) {
          console.error("Error fetching addresses:", error);
         }
         finally{
          setLoadingAddress(false);
         }
    }
    fetchAddresses();
  },[cart])

  if(!cart || cart.length === 0){
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        Cart is empty
      </div>
    )
  }



  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;
  
  const createOrder = async(paymentMethod:"razorpay" | "stripe") =>{
    if(!selectedAddress) return alert("Please select an address");

    setCreatingOrder(true);
  try {
    const {data} = await axios.post("http://localhost:5001/api/order/create",{
      addressId:selectedAddress,
      paymentMethod,
      
    },{headers:{
      Authorization:`Bearer ${localStorage.getItem("token")}`,
    }});

      return data;
    }
    
   catch (error) {
    toast.error("Error creating order");
    console.error("Create order error",error);
   }
   finally{
    
    setCreatingOrder(false);

   }

  }
  const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
  const payWithRazorpay = async() =>{
    const isLoaded = await loadRazorpay();
    if(!isLoaded){
      console.log("Razorpay SDK failed to load")
      return
    }
    try {
     setLoadingRazorpay(true);
     const order = await createOrder("razorpay"); 
     if(!order) return;
     const {orderId,amount} = order;
     const {data} = await axios.post(`${utilsService}/api/payment/create`,{orderId},
      {headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`,
      }}
     )
     const {razorpayOrderId,key} = data;

     const options ={
      key,
      amount:amount * 100,
      currency:"INR",
      name:"Zomato",
      description:"Food Order Payment",
      order_id:razorpayOrderId,
      handler :async(response:any)=>{
        try {
          await axios.post(`${utilsService}/api/payment/verify`,{
           razorpay_order_id:response.razorpay_order_id,
           razorpay_payment_id:response.razorpay_payment_id,
           razorpay_signature:response.razorpay_signature,
           orderId
          })
          toast.success("Payment Successfull 😘");
         
          navigate('/paymentsuccess/' + response.razorpay_payment_id)
        } catch (error) {
          toast.error("Payment verification Failed")
        }
      },
      theme:{
        color: "#E23744"
      }
     };
    const razopay = new(window as any).Razorpay(options);
    razopay.open()
    } catch (error) {
      console.log(error)
      toast.error("Error creating order");
    }
    finally{
      setLoadingRazorpay(false);
    }
     
  }
  //pay with Stripe
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

  const payWithStripe= async()=>{
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if(!order) return;
      const {orderId,amount} = order;
       try {
        const stripe = await stripePromise
        const {data} = await axios.post(`${utilsService}/api/payment/stripe/create`,{orderId})

        if(data.url){
          window.location.href = data.url;
        }
        else{
          toast.error("Failed to create payment session")
        }
       } catch (error) {
        console.log(error)
        toast.error("Payment failed")
       }
    } catch (error) {
      console.log(error)
      toast.error("Payment failed with Stripe")
    }
    finally{
      setLoadingStripe(false);
    }
  }


  return (
    <div className='mx-auto max-w-4xl px-4 py-6 space-y-6'>
      <h1 className='text-2xl font-bold '>Checkout</h1>
      <div className='rounded-xl bg-white p-4 shadow-sm'>
     <h2 className='tetx-lg font-semibold '>{restaurant.name}</h2>
      <p className='text-sm text-gray-500'>
        {
          restaurant.autoLocation.formattedAddress
        }
      </p>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
  <h3 className="font-semibold">Delivery Address</h3>

  {loadingAddress ? (
    <p className="text-sm text-gray-500">Loading Address...</p>
  ) : !Array.isArray(addresses) || addresses.length === 0 ? (
    <p className="text-sm text-gray-500">
      No address found. Please add one
    </p>
  ) : (
    addresses.map((add) => {
      return (
        <label
          key={add._id}
          className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition
          ${
            selectedAddress === add._id
              ? "border-[#E23744] bg-red-50"
              : "hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            checked={selectedAddress === add._id}
            onChange={() => setselectedAddress(add._id)}
          />

          <div>
            <p className="text-sm font-medium">
              {add.formattedAddress}
            </p>
            <p className="text-xs text-gray-500">
              {add.mobile}
            </p>
          </div>
        </label>
      );
    })
  )}
</div>
    <div className='rounded-xl bg-white p-4 shadow-sm space-y-4 '>
      <h3 className='font-semibold '>Order Summary</h3>
      {
        cart.map((cartItem:ICart) =>{
          const item= cartItem.itemId as IMenuItem;
          return <div className='flex justify-between text-sm'>
            {cartItem._id}
            <span>{item.name} x {cartItem.quantity}</span>
            <span>₹{item.price * cartItem.quantity}</span>
          </div>
        })
      }
      <hr />
      <div className='flex justify-between text-sm'>
        <span>Items ({quantity})</span>
        <span>₹{subTotal}</span>
      </div>
        <div className='flex justify-between text-sm'>
        <span>Delivery Fee</span>
        <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}` } </span>
      </div>
        <div className='flex justify-between text-sm'>
        <span>Platform Fee</span>
        <span>₹{platformFee}</span>
      </div>
      {
                subTotal<250 && <p className='text-xs text-gray-500'>
                  Add Item worth ₹{250 - subTotal} more to get free delivery</p>
              }
              <div className='flex justify-between text-base font-semibold border-t pt-2 '>
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
        <button className="flex items-cneter justify-center gap-2 
        w-full bg-[#3395FF] hover:bg-[#2b7edb] text-white font-semibold py-3 rounded-lg shadow-md transition duration-200" 
                      disabled ={loadingRazorpay} onClick={payWithRazorpay}>
                        {loadingRazorpay ? <BiLoader size={18} className='animate-spin'/> 
                        : <BiCreditCard size={18}/> }Pay With Razorpay</button>
                    <button className="flex items-cneter justify-center gap-2 
        w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200" 
                      disabled ={loadingStripe} onClick={payWithStripe}>
                        {loadingStripe ? <BiLoader size={18} className='animate-spin'/> 
                        : <BiCreditCard size={18}/> }Pay With Stripe</button>
      
    </div>
      

    </div>
  )
}

export default Checkout

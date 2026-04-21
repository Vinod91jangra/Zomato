import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '../context/Appcontext';
import { BiCheckCircle } from 'react-icons/bi';
import { divIcon } from 'leaflet';
import { BsArrowRight } from 'react-icons/bs';

const PaymentSuccess = () => {
    const {paymentId} = useParams<{paymentId:string}>()
    const navigate = useNavigate();
    const{fetchCart} = useAppData();

    useEffect(()=>{
      fetchCart();
    },[])
  return (
    <div className='flex min-h[70vh] items-center px-4 jceb'>
      <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-sm text-center space-y-4'>
        <BiCheckCircle size={68} className='mx-auto text-green-500'/>
        <h1 className='text-2xl font-bold text-gray-800'>
            Payment Successful
        </h1>
        <p className='text-sm text-gray-500 '>Your order has been placed Successfully</p>
        {
        paymentId && <div className=' flex justify-center items-center rounded-lg bg-white'>
            <span className='text-green-500'>PaymentID:</span>
            <p className='font-mono break-all text-green-500'>{paymentId}</p></div>}
            <div className='space-y-2 pt-2'>
            <button className='flex w-full items-center justify-center gap-2 rounded-lg 
            bg-[#E23744] p-3 text-sm font-semibold text-white hover:bg-red-500 ' onClick={()=> navigate('/')}>
                Order More <BsArrowRight size={16}/></button>
                 <button className='flex w-full items-center justify-center gap-2 rounded-lg 
            bg-[#E23744] p-3 text-sm font-semibold text-white hover:bg-red-500' onClick={()=> navigate('/order')}>
                Your Orders <BsArrowRight size={16}/></button>
            </div>
      </div>

    </div>
  )
}

export default PaymentSuccess

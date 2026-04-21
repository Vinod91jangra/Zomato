

export interface User{
    _id:string,
    name:string;
    email:string;
    image:string;
    role: string | null;
}

export interface LocationData{
    latitude: number;
    longitude:number;
    formattedAddress:string;

}

export interface AppContextType{
    user:User | null;
    loading: boolean;
    isAuth:boolean;
    setUser:React.Dispatch<React.SetStateAction <User | null>>;
    setIsAuth:React.Dispatch<React.SetStateAction <boolean>>;
    setLoading:React.Dispatch<React.SetStateAction <boolean>>;
    // setLocation:React.Dispatch<React.SetStateAction<LocationData | null>>;
    // setCity:React.Dispatch<React.SetStateAction<string>>;
    location: LocationData | null;
    loadinglocation: boolean;
    city: string;
    cart: ICart[] | [];
    fetchCart: () => Promise<void>;
    subTotal: number;
    quantity: number;
    
    

    
}

export interface IRestaurant { 
_id:string;
name:string;
description?:string;
image:string;
ownerId: string;
phone: number;
isVerified: boolean;

autoLocation: {
    type:"Point",
    coordinates: [number,number]; //[longitude,latitude]
    formattedAddress: string;
};
isOpen: boolean;
createdAt: Date;
distanceKm?: number;
}
export interface IMenuItem {
    _id:string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    isAvailable:boolean;
    updatedAt: Date;
    createdAt: Date;
}

export interface ICart {
    _id:string;
    userId: string
    restaurantId: string | IRestaurant
    itemId: string | IMenuItem;
    quantity: number;

    updatedAt: Date;
    createdAt: Date;
}

export interface IOrder {
    _id:string,
    userId:string,
    restaurantId:string,
    restaurantName:string,
    riderId? : string | null
    riderPhone :number | null
    riderName:string | null
    distance:number;
    riderAmount: number;

    items:{
        itemId:string;
        name:string;
        price:number;
        quantity:number;
    }[];
    subtotal :number;
    deliveryFee: number;
    platformFee:number;
    totalAmount:number;

    addressId:string;
    
    deliveryAddress:{
        formattedAddress:string;
        mobile:number;
        latitude:number;
        longitude:number;
    }
    status : | "placed" | 
    "accepted" | "preparing"|
     "ready_for_rider"| "rider_assigned"| 
     "picked_up" |"delivered" | "cancelled";

     paymentMethod: "razorpay" | "stripe";
     paymentStatus: "pending" | "paid" | "failed";

     expiresAt:Date;
     createdAt:Date;
     updatedAt:Date;
    
    
}
import { useState } from "react"
import { useAppData } from "../context/Appcontext";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import axios from "axios";
import { BiMapPin, BiUpload } from "react-icons/bi";


interface props {
    fetchMyRestaurant: ()=> Promise<void>;
    
}



const AddRestaurant = ({ fetchMyRestaurant }: props) => {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const[phone, setPhone] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const[submitting, setSubmitting] = useState(false);
 
    const{loadingLocation,location} = useAppData();

    const handleSubmit = async() =>{
        if(!name || !image || !location){
            alert("Please fill all the fields and select an image");
        return;}

        const formData = new FormData();   
        formData.append("name",name);
        formData.append("description",description);
        formData.append("phone",phone);
        formData.append("latitude",location.latitude.toString());
        formData.append("longitude",location.longitude.toString());
        formData.append("formattedAddress",location.formattedAddress);
        formData.append("image",image);

        try {
            setSubmitting(true);
            await axios.post(`${restaurantService}/api/restaurant/new`,formData,{
                 headers:{
                   Authorization:`Bearer ${localStorage.getItem("token")}`, 
                 },
            })
            toast.success("Restaurant added successfully");
            fetchMyRestaurant();
        } catch (error) {
           toast.error("Failed to add restaurant. Please try again."); 
        }finally{
            setSubmitting(false);
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            
            <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
                <h1 className="text-xl font-semibold">Add Your Restaurant</h1>
                <input type="text" 
                placeholder="Restaurant Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
             className="w-full rounder-lg border px-4 py-2 text-sm outline-none" />

              <input type="number" 
                placeholder="Contact Number" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
             className="w-full rounder-lg border px-4 py-2 text-sm outline-none" />

              <textarea 
                placeholder="Restaurant Description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
             className="w-full rounder-lg border px-4 py-2 text-sm outline-none" />

             <label><BiUpload className="h-5 w-5 text-red-500"></BiUpload>
             { image? image.name : "Upload Restaurant Image"}
             <input type="file" 
             accept="image/*" 
             onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} 
             className="hidden" />
             </label>  
            <div className="flex items-start gap-3 rounded-lg border p-4">
                <BiMapPin   className="mt-0.5 h-5w-5 text-red-500"/>
                <div className="text-sm">
                {loadingLocation ? "Fetching location..." :
                location ? location.formattedAddress : "Failed to fetch location"   }
            </div>
            </div>
            <button  className="w-full rounder-lg py-3 text-sm font-semibold text-white bg-[#E23744]"
            onClick={handleSubmit}            disabled={submitting}>
                {submitting ? "Submitting..." : "Add Restaurant"}
            </button>
        </div>
        </div>
    )
}


export default AddRestaurant
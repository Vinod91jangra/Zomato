import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/Appcontext";
import { useState } from "react";
import { authService } from "../main";
import axios from "axios";

 type Role = "customer" | "rider" | "seller" | null;

export const SelectRole = () =>{
   
    const [role,setRole] = useState<Role>(null);
    const {setUser} = useAppData();
    const navigate = useNavigate();


    const roles: Role[] = ["customer", "rider", "seller"];

    const addRole = async () => {
        if (!role) return;
        try {
            const { data } = await axios.put(
                `${authService}/api/auth/add/role`,
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            localStorage.setItem("token", data.token);
            setUser(data.user);
            navigate("/", { replace: true });
        } catch (error) {
            console.log(error);
        }
    }
    return <div>

        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="w-full max-w-sm space-y-6">



                <h1 className="text-center text-2xl font-bold">Choose Your Role</h1>
                <div className=" space-y-4">
                    {
                        roles.map((r) =>{
                            return <button type="button" key={r} onClick={() => setRole(r)} 
                            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium
                            capitalize transition ${
                                role === r ? "border-[#E23744] bg-[#E23744] text-white hover:bg-[#E23744]/80"
                                 : "border-gray-300 hover:bg-gray-100"
                            }`}>
                            Continue as {r}
                            </button>
                        })
                    }
             </div>
            <button type="button" disabled={!role} onClick={addRole} className={`w-full rounded-xl
                px-4 py-3 text-sm font font-semibold transition ${
                    role ? "bg-[#E23744] border-[#E23744] text-white" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}>
                    Next
                </button>
        </div>
        
       
    </div>
    </div>
}

export default SelectRole
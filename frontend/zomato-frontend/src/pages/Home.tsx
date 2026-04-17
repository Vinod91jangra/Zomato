import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/Appcontext";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";

import RestaurantCard from "../components/RestaurantCard";

const Home = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);


  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c ;// Distance in km
  };
  // ✅ Fetch Restaurants
  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Api response", data);

      // ✅ directly use backend data
      setRestaurants(data.restaurants || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchRestaurants();
    }
  }, [location?.latitude, location?.longitude, search]);

  if (loading || !location) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Finding Restaurants near you...</p>
      </div>
    );
  }
     

     return (
      <div className="mx-auto max-w-7xl px-4 py-6">{
        restaurants.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {
              restaurants.map((res) => {
              const [resLng,resLat] = res.autoLocation.coordinates;

              const distance = getDistance(location.latitude, location.longitude, resLat, resLng);
                  return <RestaurantCard key={res._id} name={res.name} id={res._id} image={res.image?? ""} distance={`${distance.toFixed(2)} `}
                  isOpen = {res.isOpen} />
              })
            }  
          </div>
        ):(
          <p className="text-center text-gray-500">No restaurant found</p>
        )


      }</div>
     )
};

export default Home;
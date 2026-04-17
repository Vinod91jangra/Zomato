
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import PublicRoute from './components/publicRoute'
import ProtectedRoute from './components/protectedRoute'
import { SelectRole } from './pages/SelectRole'
import Navbar from './components/navbar'
import Account  from './pages/Account'
import { useAppData } from './context/Appcontext'
import { Restaurant } from './pages/Restaurant'
import  RestaurantPage  from './pages/RestaurantPage'

function App() {
  
const {user} = useAppData();
if(user && user.role === "seller"){
  return <Restaurant/>
}


 return (  
<BrowserRouter>
<Navbar/>
<Routes>
  <Route element={<ProtectedRoute/>}>
    <Route path = '/' element= {<Home/>}> </Route>
    <Route path = '/select-role' element= {<SelectRole/>}> </Route>
  </Route>
  <Route element={<PublicRoute/>}>
    <Route  path = '/login' element = {<Login/>}></Route>
  </Route>
  <Route path='/account' element = {<Account/>}></Route>
  <Route path='/restaurant' element = {<Restaurant/>}></Route>
  <Route path='/restaurant/:id' element = {<RestaurantPage/>} ></Route>
  </Routes>
  </BrowserRouter>
   

  )}


export default App

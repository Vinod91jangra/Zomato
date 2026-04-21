
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
import CartPage from './pages/CartPage'
import AddAddressPage from './pages/Address'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import OrderPage from './pages/OrderPage'


function App() {
  
const {user} = useAppData();
if(user && user.role === "seller"){
  return <BrowserRouter>
    
    <Restaurant/>
  </BrowserRouter>
}


 return (  
<BrowserRouter>
<Navbar/>
<Routes>
  <Route element={<ProtectedRoute/>}>
    <Route path = '/' element= {<Home/>}> </Route>
    <Route path = '/select-role' element= {<SelectRole/>}> </Route>
    <Route path='/account' element = {<Account/>}></Route>
      <Route path='/order' element = {<Orders/>}></Route>
      <Route path='/order/:id' element = {<OrderPage/>}></Route>
  <Route path='/restaurant' element = {<Restaurant/>}></Route>
  <Route path='/restaurant/:id' element = {<RestaurantPage/>} ></Route>
  <Route path = '/cart' element = {<CartPage/>}></Route>
  <Route path='/addresses' element={<AddAddressPage/>}></Route>
  <Route path='/checkout' element={<Checkout/>}></Route>
  <Route path='/paymentsuccess/:paymentId' element={<PaymentSuccess/>}></Route>
  <Route path='/ordersuccess/' element={<OrderSuccess/>}></Route>
  
  </Route>
  <Route element={<PublicRoute/>}>
    <Route  path = '/login' element = {<Login/>}></Route>
  </Route>
  
  
  </Routes>
  </BrowserRouter>
   

  )}


export default App

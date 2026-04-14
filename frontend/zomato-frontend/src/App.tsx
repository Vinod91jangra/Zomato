import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import {Toaster} from "react-hot-toast"
import PublicRoute from './components/publicRoute'
import ProtectedRoute from './components/protectedRoute'
import { SelectRole } from './pages/selectRole'
function App() {
  

  return <>
<BrowserRouter>
<Routes>
  <Route element={<ProtectedRoute/>}>
    <Route path = '/' element= {<Home/>}> </Route>
    <Route path = '/select-role' element= {<SelectRole/>}> </Route>
  </Route>
  <Route element={<PublicRoute/>}>
    <Route  path = '/login' element = {<Login/>}></Route>
  </Route>
  </Routes>
  <Toaster/>
  </BrowserRouter>
   
  </>
}

export default App

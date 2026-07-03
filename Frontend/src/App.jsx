import React from 'react'
import { Routes, Route , Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage.jsx";
import LoginPage from "./components/LoginPage.jsx"
import RegisterPage from './components/RegisterPage.jsx';
import toast,{Toaster} from "react-hot-toast";
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { axiosInstance } from './lib/axios.js'
import Home from "./components/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";
import MyAccounts from './pages/MyAccounts.jsx';
import Transaction from './pages/Transaction.jsx';
import CreateAccount from './pages/CreateAccount.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

const App = () => {

const{data:authData, isLoading, error} = useQuery({
   queryKey: ['authUser'],
   queryFn: async () => {
      const res = await axiosInstance.get('/auth/me');
      return res.data;
   },
   retry:false,
  });


const authUser = authData?.user

if (isLoading) {
  return <div>Loading...</div>;
}

  return (
  
   <div>
    {/* jb koi api k through pass krnas chahe so we have protect api */}
    
    <AuthProvider value={{ authUser }}>
      <Routes>
        <Route path="/" element={ <LandingPage/>} />
        <Route path="/register" element={ !authUser ? <RegisterPage />: <Navigate to="/home/dashboard" />} />
      <Route path="/login" element={ !authUser ? (  <LoginPage /> ) : authUser.role === "ADMIN" ? (
      <Navigate to="/admindashboard" /> ) : (  <Navigate to="/home/dashboard" /> )}/>
         <Route path="/home" element={authUser ? <Home /> : <Navigate to="/login" />} >
              <Route index element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<DashboardPage />} />
                <Route path="accounts" element={<MyAccounts />} />
               <Route path="transaction" element={< Transaction/>} />
                <Route path="create" element={< CreateAccount/>} />
               </Route>
         <Route path="/AdminDashboard" element={authUser ? ( authUser.role === "ADMIN" ? (
        <AdminDashboard /> ) : (  <Navigate to="/home/dashboard" /> )) : ( <Navigate to="/login" />  )} />      
      </Routes>
    </AuthProvider>

<Toaster/>

</div>
  )
}

export default App



// axios documentation okie
// next.js start 

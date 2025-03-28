import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import "./App.css";
import Login from "./Login.jsx";
import RegisterBuyer from "./RegisterBuyer.jsx";
import AdminLayout from "./layouts/Admin/Admin.jsx";
import RegisterSeller from "./RegisterSeller.jsx";
import VantaGlobe from "./views/VantaGlobe.jsx";
import ApproveRequest from "./views/ApproveRequest.jsx";
import AddLand from "./layouts/Admin/AddLand.jsx";
import SellerInfo from "./SellerInfo.jsx"
import SellerDashboard from "./views/SellerDashboard.jsx";
import Dashboard from "./views/Dashboard.jsx";
import BuyerProfile from "./views/BuyerProfile.jsx";
import UpdateBuyer from "./views/UpdateBuyer.jsx"; 
import ViewImage from "./views/ViewImage.jsx";
import BuyerInfo from "./BuyerInfo.jsx";
import LIDashboard from "./views/LIDashboard.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Vanta" element={<VantaGlobe />} />

          {/* Land Inspector */}

          <Route path="/LIDashboard" element={<LIDashboard />} />
          <Route path="/SellerInfo" element={<SellerInfo />} />
          <Route path="/BuyerInfo" element={<BuyerInfo />} />


          {/* Seller */}
          {/* sellerProfile*, updateSeller */}
          <Route path="/RegisterSeller" element={<RegisterSeller />} />
          <Route path="/SellerDashboard" element={<SellerDashboard />} />
          <Route path="/SellerDashBoard/viewImage" element={<ViewImage />} />
          <Route path="/addLand" element={<AddLand />} />
          <Route path="/approve" element={<ApproveRequest />} />

          {/* Buyer */}
          {/* makePayment */}
          <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
          <Route path="/RegisterBuyer" element={<RegisterBuyer />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/UpdateBuyer" element={<UpdateBuyer />} />
          <Route path="/BuyerProfile" element={<BuyerProfile />} />
          <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
          <Route path="/approve" element={<ApproveRequest />} />

          <Route path="/LI" render={(props) => <LI {...props} />} /> 

        </Routes>
      </Router>
    </>
  );
}

export default App;
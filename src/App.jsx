import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import "./App.css";
import Login from "./Login.jsx";
import RegisterBuyer from "./RegisterBuyer.jsx";
import AdminLayout from "./layouts/Admin/Admin.jsx";
import RegisterSeller from "./RegisterSeller.jsx";
import VantaGlobe from "./views/VantaGlobe.jsx";
import ApproveRequest from "./views/ApproveRequest.jsx";
import AddLandd from "./layouts/Admin/AddLandd.jsx";
import SellerInfo from "./SellerInfo.jsx"

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Vanta" element={<VantaGlobe />} />
           <Route path="/RegisterBuyer" element={<RegisterBuyer />} />
          <Route path="/RegisterSeller" element={<RegisterSeller />} />
          <Route path="/addLand" element={<AddLandd />} />
          <Route path="/SellerInfo" element={<SellerInfo />} />
          <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
          <Route path="/approve" element={<ApproveRequest />} />
          <Route path="/LI" render={(props) => <LI {...props} />} /> 

        </Routes>
      </Router>
    </>
  );
}

export default App;
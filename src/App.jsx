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
import SellerInfo from "./SellerInfo.jsx";
import SellerDashboard from "./views/SellerDashboard.jsx";
import BuyerDashboard from "./views/Dashboard.jsx";
import BuyerProfile from "./views/BuyerProfile.jsx";
import UpdateBuyer from "./views/UpdateBuyer.jsx";
import UpdateSeller from "./views/UpdateSeller.jsx";
import ViewImage from "./views/ViewImage.jsx";
import SellerProfile from "./views/SellerProfile.jsx";
import BuyerInfo from "./BuyerInfo.jsx";
import LIDashboard from "./views/LIDashboard.jsx";
import OwnedLands from "./views/OwnedLands.jsx";
import MakePayment from "./views/MakePayment.jsx";
import TransactionInfo from "./views/TransactionInfo.jsx";
import ProcessFlowChart from "./ProcessFLowChart.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Vanta" element={<VantaGlobe />} />
          <Route path="/ProcessFlowChart" element={<ProcessFlowChart />} />
          <Route path="/registerbuyer" element={<RegisterBuyer />} />
          <Route path="/registerseller" element={<RegisterSeller />} />
          {/* Seller */}
          <Route path="/sellerdashboard">
            <Route index element={<SellerDashboard />} />
            <Route path="addLand" element={<AddLand />} />
            <Route path="viewImage" element={<ViewImage />} />
            <Route path="sellerprofile" element={<SellerProfile />} />
            <Route path="approveRequest" element={<ApproveRequest />} />
            <Route path="updateseller" element={<UpdateSeller />} />
          </Route>
          {/* Buyer */}
          <Route path="/buyerdashboard">
            <Route index element={<BuyerDashboard />} />
            <Route path="updatebuyer" element={<UpdateBuyer />} />
            <Route path="buyerprofile" element={<BuyerProfile />} />
            <Route path="ownedlands" element={<OwnedLands />} />
            <Route path="makepayment" element={<MakePayment />} />
          </Route>

          {/* Land Inspector */}
          <Route path="/lidashboard">
            <Route index element={<LIDashboard />} />
            <Route path="buyerinfo" element={<BuyerInfo />} />
            <Route path="sellerinfo" element={<SellerInfo />} />
            <Route path="transactioninfo" element={<TransactionInfo />} />
          </Route>

          <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
          <Route path="/LI" render={(props) => <LI {...props} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

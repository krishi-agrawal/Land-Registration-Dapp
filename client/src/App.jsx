import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./login.component.jsx";
import RegisterBuyer from "./RegisterBuyer.jsx";
import AdminLayout from "./layouts/Admin/Admin.jsx";
import RegisterSeller from "./RegisterSeller.jsx";
import VantaGlobe from "./views/VantaGlobe.jsx";
// import "./assets/scss/black-dashboard-react.scss";
// import "./assets/demo/demo.css";
// import "./assets/css/nucleo-icons.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import ThemeContextWrapper from "./components/ThemeWrapper/ThemeWrapper";
// import BackgroundColorWrapper from "./components/BackgroundColorWrapper/BackgroundColorWrapper";
// import Help from './Help';

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
          <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
          <Route path="/LI" render={(props) => <LI {...props} />} /> 
        </Routes>
      </Router>
    </>
  );
}

export default App;
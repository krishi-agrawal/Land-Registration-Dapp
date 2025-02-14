import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";

// Core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import FixedPlugin from "../../components/FixedPlugin/FixedPlugin";
import AddLand from "../../views/AddLand";
import routes from "../../routes";

import logo from "../../assets/img/react-logo.png";
import { BackgroundColorContext } from "../../contexts/BackgroundColorContext";

function Land() {
  const location = useLocation();
  const mainPanelRef = React.useRef(null);
  const psRef = React.useRef(null);
  const [sidebarOpened, setsidebarOpened] = React.useState(
    document.documentElement.classList.contains("nav-open")
  );

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.classList.add("perfect-scrollbar-on");
      document.documentElement.classList.remove("perfect-scrollbar-off");

      psRef.current = new PerfectScrollbar(mainPanelRef.current, { suppressScrollX: true });

      document.querySelectorAll(".table-responsive").forEach((table) => {
        new PerfectScrollbar(table);
      });
    }

    return () => {
      if (navigator.platform.indexOf("Win") > -1 && psRef.current) {
        psRef.current.destroy();
        document.documentElement.classList.add("perfect-scrollbar-off");
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  }, []);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setsidebarOpened((prev) => !prev);
  };

  return (
    <BackgroundColorContext.Consumer>
      {({ color, changeColor }) => (
        <>
          <div className="wrapper flex h-screen bg-gray-100">
            <Sidebar
              routes={routes}
              logo={{
                outterLink: "#",
                text: "Land Registration",
                imgSrc: logo,
              }}
              toggleSidebar={toggleSidebar}
            />
            <div className="main-panel flex-1 flex flex-col overflow-hidden" ref={mainPanelRef} data={color}>
              <AdminNavbar />
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <Routes>
                  <Route path="/admin/AddLand" element={<AddLand />} />
                  <Route path="*" element={<Navigate to="/admin/AddLand" />} />
                </Routes>
              </div>
            </div>
          </div>
          <FixedPlugin bgColor={color} handleBgClick={changeColor} />
        </>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default Land;
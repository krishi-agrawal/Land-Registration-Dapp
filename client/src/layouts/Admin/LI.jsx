import React from "react";
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
import { ethers } from "ethers"; // Import Ethers.js

// Core Components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import Footer from "../../components/Footer/Footer";
import Sidebar from "../../components/Sidebar/Sidebar";
import FixedPlugin from "../../components/FixedPlugin/FixedPlugin";
import LIDashboard from "../../views/LIDashboard";
import routes from "../../routesLI";

import logo from "../../assets/img/react-logo.png";
import { BackgroundColorContext } from "../../contexts/BackgroundColorContext";

var ps;

function LI(props) {
  const location = useLocation();
  const mainPanelRef = React.useRef(null);
  const [sidebarOpened, setsidebarOpened] = React.useState(
    document.documentElement.className.indexOf("nav-open") !== -1
  );

  // Initialize Ethers.js provider (example)
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(mainPanelRef.current, {
        suppressScrollX: true,
      });
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    // Cleanup
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.documentElement.classList.add("perfect-scrollbar-off");
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  }, []);

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanelRef.current) {
      mainPanelRef.current.scrollTop = 0;
    }
  }, [location]);

  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setsidebarOpened(!sidebarOpened);
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/LI") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Land Registration";
  };

  return (
    <BackgroundColorContext.Consumer>
      {({ color, changeColor }) => (
        <React.Fragment>
          <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar
              routes={routes}
              logo={{
                outterLink: "#",
                text: "Land Registration",
                imgSrc: logo,
              }}
              toggleSidebar={toggleSidebar}
            />

            {/* Main Panel */}
            <div
              className="flex-1 flex flex-col overflow-hidden"
              ref={mainPanelRef}
              data={color}
            >
              {/* Navbar */}
              <AdminNavbar
                brandText={getBrandText(location.pathname)}
                toggleSidebar={toggleSidebar}
                sidebarOpened={sidebarOpened}
              />

              {/* Main Content */}
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                <Switch>
                  {getRoutes(routes)}
                  <Redirect from="*" to="/LI/LIDashboard" />
                </Switch>
              </main>

              {/* Footer */}
              <Footer fluid />
            </div>
          </div>

          {/* Fixed Plugin (Optional) */}
          {/* <FixedPlugin bgColor={color} handleBgClick={changeColor} /> */}
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default LI;
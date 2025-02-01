import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
// import PerfectScrollbar from "perfect-scrollbar";
import { Nav } from "reactstrap";
import {
  BackgroundColorContext,
  backgroundColors,
} from "../../contexts/BackgroundColorContext";

let ps;

function Sidebar(props) {
  const location = useLocation();
  const sidebarRef = React.useRef(null);

  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "bg-blue-500 text-white" : "text-gray-700";
  };

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebarRef.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return () => {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  }, []);

  const linkOnClick = () => {
    document.documentElement.classList.remove("nav-open");
  };

  const { routes, rtlActive, logo } = props;
  let logoImg = null;
  let logoText = null;

  if (logo !== undefined) {
    if (logo.outterLink !== undefined) {
      logoImg = (
        <a
          href={logo.outterLink}
          className="flex items-center p-4 text-gray-900 hover:text-gray-700"
          target="_blank"
          onClick={props.toggleSidebar}
        >
          <div className="flex-shrink-0">
            <img src={logo.imgSrc} alt="react-logo" className="h-8 w-8" />
          </div>
        </a>
      );
      logoText = (
        <a
          href={logo.outterLink}
          className="flex items-center p-4 text-gray-900 hover:text-gray-700"
          target="_blank"
          onClick={props.toggleSidebar}
        >
          <span className="ml-3 text-xl font-semibold">{logo.text}</span>
        </a>
      );
    } else {
      logoImg = (
        <Link
          to={logo.innerLink}
          className="flex items-center p-4 text-gray-900 hover:text-gray-700"
          onClick={props.toggleSidebar}
        >
          <div className="flex-shrink-0">
            <img src={logo.imgSrc} alt="react-logo" className="h-8 w-8" />
          </div>
        </Link>
      );
      logoText = (
        <Link
          to={logo.innerLink}
          className="flex items-center p-4 text-gray-900 hover:text-gray-700"
          onClick={props.toggleSidebar}
        >
          <span className="ml-3 text-xl font-semibold">{logo.text}</span>
        </Link>
      );
    }
  }

  return (
    <BackgroundColorContext.Consumer>
      {({ color }) => (
        <div className={`sidebar bg-${color}-100 h-screen w-64 fixed flex flex-col`}>
          <div className="sidebar-wrapper overflow-y-auto flex-1" ref={sidebarRef}>
            {(logoImg || logoText) && (
              <div className="logo">
                {logoImg}
                {logoText}
              </div>
            )}
            <Nav className="flex flex-col space-y-2 p-4">
              {routes.map((prop, key) => {
                if (prop.redirect) return null;
                return (
                  <li
                    className={`rounded-lg transition-colors duration-200 ${activeRoute(prop.path)} ${
                      prop.pro ? "bg-gradient-to-r from-blue-400 to-blue-600" : ""
                    }`}
                    key={key}
                  >
                    <NavLink
                      to={prop.layout + prop.path}
                      className="flex items-center p-3 hover:bg-blue-50 rounded-lg"
                      activeClassName="bg-blue-500 text-white"
                      onClick={props.toggleSidebar}
                    >
                      <i className={`${prop.icon} mr-3`} />
                      <p className="text-sm font-medium">{rtlActive ? prop.rtlName : prop.name}</p>
                    </NavLink>
                  </li>
                );
              })}
            </Nav>
          </div>
        </div>
      )}
    </BackgroundColorContext.Consumer>
  );
}

Sidebar.defaultProps = {
  rtlActive: false,
  routes: [{}],
};

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    text: PropTypes.node,
    imgSrc: PropTypes.string,
  }),
};

export default Sidebar;
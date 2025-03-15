import React from "react";

function AdminNavbar(props) {
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const [modalSearch, setModalSearch] = React.useState(false);
  const [color, setColor] = React.useState("bg-transparent");

  React.useEffect(() => {
    const updateColor = () => {
      if (window.innerWidth < 993 && collapseOpen) {
        setColor("bg-white shadow-lg");
      } else {
        setColor("bg-transparent");
      }
    };

    window.addEventListener("resize", updateColor);
    return () => window.removeEventListener("resize", updateColor);
  }, [collapseOpen]);

  const toggleCollapse = () => {
    setCollapseOpen(!collapseOpen);
    setColor(collapseOpen ? "bg-transparent" : "bg-white shadow-lg");
  };

  const toggleModalSearch = () => {
    setModalSearch(!modalSearch);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${color}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Brand and Toggle */}
            <div className="flex items-center">
              <button
                className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={props.toggleSidebar}
              >
                <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-800"></div>
              </button>
              <a
                href="#pablo"
                onClick={(e) => e.preventDefault()}
                className="ml-4 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
              >
                {props.brandText}
              </a>
            </div>

            {/* Right Side: Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Search Button */}
              <button
                className="text-gray-800 hover:text-blue-600 focus:outline-none"
                onClick={toggleModalSearch}
              >
                <i className="tim-icons icon-zoom-split" />
                <span className="ml-2">Search</span>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button className="text-gray-800 hover:text-blue-600 focus:outline-none">
                  <i className="tim-icons icon-sound-wave" />
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4">
                  <div className="text-sm font-semibold mb-2">Notifications</div>
                  <div className="space-y-2">
                    <div className="text-gray-700">Mike John responded to your email</div>
                    <div className="text-gray-700">You have 5 more tasks</div>
                    <div className="text-gray-700">Your friend Michael is in town</div>
                    <div className="text-gray-700">Another notification</div>
                    <div className="text-gray-700">Another one</div>
                  </div>
                </div>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center focus:outline-none">
                  <img
                    src={require("assets/img/anime3.png").default}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="ml-2 text-gray-800 hover:text-blue-600">Profile</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-4">
                  <div className="space-y-2">
                    <div className="text-gray-700 hover:text-blue-600">Profile</div>
                    <div className="text-gray-700 hover:text-blue-600">Settings</div>
                    <div className="border-t border-gray-200"></div>
                    <div className="text-gray-700 hover:text-blue-600">Log out</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={toggleCollapse}
            >
              <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-800"></div>
            </button>
          </div>

          {/* Mobile Collapse Menu */}
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              collapseOpen ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="flex flex-col items-center space-y-4 py-4">
              <button
                className="text-gray-800 hover:text-blue-600 focus:outline-none"
                onClick={toggleModalSearch}
              >
                <i className="tim-icons icon-zoom-split" />
                <span className="ml-2">Search</span>
              </button>

              <div className="text-gray-800 hover:text-blue-600">
                <i className="tim-icons icon-sound-wave" />
                <span className="ml-2">Notifications</span>
              </div>

              <div className="flex items-center">
                <img
                  src={require("assets/img/anime3.png").default}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="ml-2 text-gray-800 hover:text-blue-600">Profile</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {modalSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                placeholder="SEARCH"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={toggleModalSearch}
                className="ml-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminNavbar;
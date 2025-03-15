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
              <a
                href="/Help"
                className="text-gray-800 hover:text-blue-600 font-semibold transition-colors"
              >
                <h3>Help?</h3>
              </a>
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
              collapseOpen ? "max-h-40" : "max-h-0"
            }`}
          >
            <div className="flex flex-col items-center space-y-4 py-4">
              <a
                href="/Help"
                className="text-gray-800 hover:text-blue-600 font-semibold transition-colors"
              >
                <h3>Help?</h3>
              </a>
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
import React from "react";
import { ThemeContext, themes } from "../../contexts/ThemeContext";
import { backgroundColors } from "../../contexts/BackgroundColorContext";

function FixedPlugin(props) {
  const [dropDownIsOpen, setDropDownIsOpen] = React.useState(false);
  const handleClick = () => setDropDownIsOpen(!dropDownIsOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-lg rounded-lg p-4 w-64">
      <button
        onClick={handleClick}
        className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <i className="fa fa-cog fa-2x" />
      </button>
      {dropDownIsOpen && (
        <ul className="mt-4 bg-gray-900 text-white rounded-lg p-4 shadow-xl">
          <li className="text-lg font-semibold border-b border-gray-700 pb-2 mb-2">
            Sidebar Background
          </li>
          <li className="flex justify-center space-x-3 py-2">
            <button
              className={`w-8 h-8 rounded-full ${
                props.bgColor === backgroundColors.primary ? "ring-2 ring-white" : ""
              } bg-blue-500`}
              onClick={() => props.handleBgClick(backgroundColors.primary)}
            />
            <button
              className={`w-8 h-8 rounded-full ${
                props.bgColor === backgroundColors.blue ? "ring-2 ring-white" : ""
              } bg-blue-400`}
              onClick={() => props.handleBgClick(backgroundColors.blue)}
            />
            <button
              className={`w-8 h-8 rounded-full ${
                props.bgColor === backgroundColors.green ? "ring-2 ring-white" : ""
              } bg-green-500`}
              onClick={() => props.handleBgClick(backgroundColors.green)}
            />
          </li>
          <li className="flex items-center justify-between py-2">
            <span className="text-sm">Light Mode</span>
            <ThemeContext.Consumer>
              {({ changeTheme }) => (
                <>
                  <button
                    className="w-6 h-6 bg-gray-300 rounded-full"
                    onClick={() => changeTheme(themes.light)}
                  />
                  <button
                    className="w-6 h-6 bg-gray-800 rounded-full ml-2"
                    onClick={() => changeTheme(themes.dark)}
                  />
                </>
              )}
            </ThemeContext.Consumer>
            <span className="text-sm">Dark Mode</span>
          </li>
          <li className="mt-4 text-center">
            <a
              href="https://demos.creative-tim.com/black-dashboard-react/#/documentation/tutorial"
              className="inline-block bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Documentation
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}

export default FixedPlugin;

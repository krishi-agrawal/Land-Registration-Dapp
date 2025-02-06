import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto text-center">
        {/* Uncomment if navigation links are needed */}
        {/* <nav className="flex justify-center space-x-6 mb-4">
          <a href="https://www.creative-tim.com/?ref=bdr-user-archive-footer" className="text-gray-400 hover:text-white">Land Registry</a>
          <a href="https://www.creative-tim.com/presentation?ref=bdr-user-archive-footer" className="text-gray-400 hover:text-white">About Us</a>
          <a href="https://www.creative-tim.com/blog?ref=bdr-user-archive-footer" className="text-gray-400 hover:text-white">Blog</a>
        </nav> */}
        <div className="text-sm">
          © {new Date().getFullYear()} made with <span className="text-red-500">❤</span> for
          <a
            href="https://www.creative-tim.com/?ref=bdr-user-archive-footer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 ml-1"
          >
            Land Registration
          </a>
          , taking a step towards Digitalization.
        </div>
      </div>
    </footer>
  );
}

export default Footer;

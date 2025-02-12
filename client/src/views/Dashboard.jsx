import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

const Dashboard = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [count, setCount] = useState(0);
  const [requested, setRequested] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
  }, []);

  if (!provider) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-sky-400 to-sky-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <i className="fa fa-users text-4xl mb-4"></i>
            <p className="text-lg">Total Sellers</p>
            <p className="text-2xl font-bold">-</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <i className="fa fa-landmark text-4xl mb-4"></i>
            <p className="text-lg">Registered Lands Count</p>
            <p className="text-2xl font-bold">-</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <i className="fa fa-bell text-4xl mb-4"></i>
            <p className="text-lg">Total Requests</p>
            <p className="text-2xl font-bold">-</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <h5 className="text-xl font-bold">Profile</h5>
          </div>
          <div className="p-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              View Profile
            </button>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg">
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <h5 className="text-xl font-bold">Owned Lands</h5>
          </div>
          <div className="p-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              View Your Lands
            </button>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg">
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <h5 className="text-xl font-bold">Make Payments</h5>
          </div>
          <div className="p-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Make Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
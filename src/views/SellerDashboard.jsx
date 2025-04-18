import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const SDash = () => {
  const navigate = useNavigate();

  // States
  const {
    account,
    contract,
    isSeller: registered,
    isVerified: verified,
    loading: walletLoading,
  } = useWallet();
  const [loading, setLoading] = useState(true);
  const [landsCount, setLandsCount] = useState(0);
  const [buyersCount, setBuyersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [lands, setLands] = useState([]);
  const [isLoadingLands, setIsLoadingLands] = useState(true);

  const viewImage = (landId) => {
    navigate("/viewImage", { state: { landId } });
  };

  useEffect(() => {
    const loadContractData = async (contractInstance, currentAccount) => {
      try {
        setLoading(true);

        // Get all counts in parallel
        const [landsTotal, buyersTotal, requestsTotal] = await Promise.all([
          contractInstance.getLandsCount(),
          contractInstance.getBuyersCount(),
          contractInstance.getRequestsCount(),
        ]);

        setLandsCount(landsTotal.toNumber());
        setBuyersCount(buyersTotal.toNumber());
        setRequestsCount(requestsTotal.toNumber());

        // Load land details if there are any lands
        if (landsTotal.toNumber() > 0) {
          await loadLandDetails(
            contractInstance,
            currentAccount,
            landsTotal.toNumber()
          );
        } else {
          setLands([]);
          setIsLoadingLands(false);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (contract && account) {
      loadContractData(contract, account);
    }
  }, [contract, account]);

  const handleLogout = () => {
    // Add any logout logic here if needed (e.g., clearing local storage)
    // Then navigate to login page
    navigate('/');
  };

  const loadLandDetails = async (contract, account, count) => {
    setIsLoadingLands(true);
    try {
      // Get all land owners in parallel
      const ownerPromises = Array.from({ length: count }, (_, i) =>
        contract.getLandOwner(i + 1)
      );
      const ownerStatuses = await Promise.all(ownerPromises);

      // Filter lands owned by current account and get their details
      const landIndices = ownerStatuses
        .map((owner, index) =>
          owner.toLowerCase() === account.toLowerCase() ? index + 1 : null
        )
        .filter(Boolean);

      const landDetails = await Promise.all(
        landIndices.map((landId, idx) => getLandDetails(contract, landId, idx))
      );

      setLands(landDetails.filter((land) => land !== null));
    } catch (error) {
      console.error("Error loading land data:", error);
    } finally {
      setIsLoadingLands(false);
    }
  };

  const getLandDetails = async (contract, id, idx) => {
    try {
      const land = await contract.lands(id);
      return {
        id: idx + 1,
        originalId: id,
        area: land.area.toString(),
        city: land.city,
        state: land.state,
        price: land.landPrice.toString(),
        propertyPID: land.propertyPID.toString(),
        surveyNumber: land.physicalSurveyNumber.toString(),
      };
    } catch (error) {
      console.error(`Error fetching details for land ID ${id}:`, error);
      return null;
    }
  };

  // Show loading spinner if wallet or data is loading
  if (walletLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  // Show message if not registered seller
  if (!registered) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center text-red-600">
              You are not verified to view this page
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your land properties and Listings
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center"
        >
          <svg
            className="h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Buyers Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 flex items-center">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-blue-100 font-medium">Total Buyers</p>
                <p className="text-3xl font-bold text-white">{buyersCount}</p>
              </div>
            </div>
          </div>

          {/* Lands Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 flex items-center">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-orange-100 font-medium">Registered Lands</p>
                <p className="text-3xl font-bold text-white">{landsCount}</p>
              </div>
            </div>
          </div>

          {/* Requests Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 flex items-center">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-purple-100 font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-white">{requestsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Add Land Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-gray-700 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h5 className="text-lg font-bold text-gray-800">
                  Add New Land
                </h5>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-600 mb-4">
                Register a new land property on blockchain.
              </p>
              <button
                onClick={() => navigate("/sellerdashboard/addland")}
                disabled={!verified}
                className={`flex items-center justify-between w-full text-white font-medium py-2 px-4 rounded-lg transition-colors ${
                  verified
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>Add Land</span>
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-gray-700 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h5 className="text-lg font-bold text-gray-800">Profile</h5>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-600 mb-4">
                View and manage your seller profile
              </p>
              <button
                onClick={() => navigate("/sellerdashboard/sellerprofile")}
                className="flex items-center justify-between w-full text-white font-medium py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                <span>View Profile</span>
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Requests Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-gray-700 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h5 className="text-lg font-bold text-gray-800">
                  Land Requests
                </h5>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-600 mb-4">
                View and approve requests for your lands
              </p>
              <button
                onClick={() =>
                  verified && navigate("/sellerdashboard/approverequest")
                }
                disabled={!verified}
                className={`flex items-center justify-between w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                  verified
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>View Requests</span>
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Lands Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-100 flex items-center">
            <svg
              className="h-5 w-5 text-gray-700 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h4 className="text-lg font-bold text-gray-800">
              Your Registered Lands
            </h4>
          </div>
          <div className="p-5 overflow-x-auto">
            {isLoadingLands ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your land properties...</p>
              </div>
            ) : lands.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg">
                      Land ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      Area
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      City
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      State
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      Price (in ETH)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      Property PID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg">
                      Survey Number
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lands.map((land, index) => (
                    <tr
                      key={land.id}
                      className={
                        index % 2 === 0
                          ? "bg-white hover:bg-blue-50"
                          : "bg-gray-50 hover:bg-blue-50"
                      }
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{land.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {land.area}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {land.city}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {land.state}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {ethers.utils.formatEther(land.price)} ETH
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {land.propertyPID}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {land.surveyNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <svg
                    className="h-12 w-12 text-gray-300 mb-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-lg font-medium">No lands registered yet</p>
                  <p className="text-sm mt-1">
                    Add your first land by clicking the "Add Land" button above
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Images Card */}
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-gray-700 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h5 className="text-lg font-bold text-gray-800">
                Land Images Gallery
              </h5>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 mb-4">
              Browse all images of registered land properties
            </p>
            <button
              onClick={() => navigate("/SellerdashBoard/viewimage")}
              className="flex items-center justify-between w-full text-white font-medium py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              <span>View Images</span>
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDash;

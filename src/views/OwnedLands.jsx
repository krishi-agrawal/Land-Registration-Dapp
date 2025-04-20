import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const OwnedLands = () => {
  const {
    account,
    contract,
    isBuyer: isRegistered,
    isVerified,
    isRejected,
    loading,
  } = useWallet();
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchLandData = async (contract, currentAddress) => {
      try {
        setIsLoading(true);

        // Get total lands count in a single call
        const count = await contract.getLandsCount();
        const landsCount = parseInt(count.toString());

        // First fetch all owner addresses in parallel
        const ownerPromises = [];
        for (let i = 1; i <= landsCount; i++) {
          ownerPromises.push(contract.getLandOwner(i));
        }

        const allOwners = await Promise.all(ownerPromises);

        // Filter land IDs that belong to current user before fetching additional data
        const relevantLandIds = [];
        for (let i = 0; i < allOwners.length; i++) {
          if (allOwners[i].toLowerCase() === currentAddress.toLowerCase()) {
            relevantLandIds.push(i + 1); // Add 1 because IDs start from 1
          }
        }

        // Only fetch additional data for lands that belong to the current user
        const landDataPromises = relevantLandIds.map((landId, index) => {
          return Promise.all([
            Promise.resolve(allOwners[landId - 1]), // Use already fetched owner
            contract.getArea(landId),
            contract.getCity(landId),
            contract.getState(landId),
            contract.getPrice(landId),
            contract.getPID(landId),
            contract.getSurveyNumber(landId),
          ]).then(([owner, area, city, state, price, pid, surveyNumber]) => ({
            id: index + 1, // Sequential ID for display
            owner,
            area: area.toString(),
            city,
            state,
            price: ethers.utils.formatEther(price),
            pid: pid.toNumber(),
            surveyNumber: surveyNumber.toString(),
          }));
        });

        const landsList = await Promise.all(landDataPromises);

        setLands(landsList);
      } catch (error) {
        console.error("Error fetching land data:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
    if (contract && account) fetchLandData(contract, account);
  }, [contract, account]);

  // UI Rendering
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Connecting to contract...
          </h1>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600">
            You are not registered as a buyer
          </h1>
          <p className="mt-2 text-gray-600">
            Please register as a buyer to view your lands.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Properties</h1>
          <p className="text-gray-600 mt-1">
            View all your purchased land assets
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-lg mr-4">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Lands</h2>
                  <p className="text-blue-100 mt-1">
                    Properties you've successfully purchased
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/buyerDashboard")}
                className="flex items-center text-white bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Return to Dashboard
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
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
                      Price (in ₹)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      Property ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg">
                      Survey Number
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lands.length > 0 ? (
                    lands.map((land, index) => (
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
                          ₹{land.price}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {land.pid}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {land.surveyNumber}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-gray-500"
                      >
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
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                          <p className="text-lg font-medium">
                            No lands purchased yet
                          </p>
                          <p className="text-sm mt-1">
                            When you purchase land, it will appear here
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnedLands;

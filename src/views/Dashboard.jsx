import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";

const Dashboard = () => {
  const navigate = useNavigate();

  // States
  const {
    account,
    contract,
    isVerified: verified,
    isRejected: rejected,
    loading,
  } = useWallet();
  const [count, setCount] = useState(0);
  const [sellersCount, setSellersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [landData, setLandData] = useState([]);
  const [isLoadingLands, setIsLoadingLands] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const landsPerPage = 6;

  useEffect(() => {
    const loadContractData = async (contractInstance, currentAccount) => {
      try {
        if (!contractInstance) {
          console.error("Contract instance is null or undefined");
          return;
        }

        // Get counts in parallel
        const [landsCount, sellerCount, reqCount] = await Promise.all([
          contractInstance.getLandsCount(),
          contractInstance.getSellersCount(),
          contractInstance.getRequestsCount(),
        ]);

        setCount(parseInt(landsCount.toString()));
        setSellersCount(parseInt(sellerCount.toString()));
        setRequestsCount(parseInt(reqCount.toString()));

        // Load land data
        await loadLandData(contractInstance, parseInt(landsCount.toString()));
      } catch (error) {
        console.error("Error loading contract data:", error);
      }
    };

    if (contract) {
      loadContractData(contract, account);
    } else {
      console.log("Contract not initialized yet");
    }
  }, [contract, account]);

  const getLandDetails = async (contract, id, isRequested, idx) => {
    try {
      // Run all queries in parallel rather than sequentially
      const [land, owner, image, document] = await Promise.all([
        contract.lands(id),
        contract.getLandOwner(id),
        contract.getImage(id),
        contract.getDocument(id),
      ]);

      return {
        id: idx,
        originalId: id,
        area: land.area.toString(),
        city: land.city,
        state: land.state,
        price: land.landPrice.toString(),
        pid: land.propertyPID.toString(),
        surveyNumber: land.physicalSurveyNumber.toString(),
        owner,
        isRequested,
        image,
        document,
      };
    } catch (error) {
      console.error(`Error fetching details for land ID ${id}:`, error);
      return null;
    }
  };

  const loadLandData = async (contractInstance, count) => {
    setIsLoadingLands(true);
    try {
      // Pre-check for requested lands in a single batch
      const requestStatusPromises = [];
      for (let i = 1; i <= count; i++) {
        requestStatusPromises.push(contractInstance.isRequested(i));
      }
      const requestStatuses = await Promise.all(requestStatusPromises);

      // Gather all land detail promises for non-requested lands
      const landPromises = [];
      let idx = 0;

      for (let i = 1; i <= count; i++) {
        if (!requestStatuses[i - 1]) {
          // If not requested
          idx++;
          landPromises.push(getLandDetails(contractInstance, i, false, idx));
        }
      }

      // Execute all promises in parallel
      const landsWithNulls = await Promise.all(landPromises);

      // Filter out any nulls from failed requests
      const lands = landsWithNulls.filter((land) => land !== null);

      setLandData(lands);
    } catch (error) {
      console.error("Error loading land data:", error);
    } finally {
      setIsLoadingLands(false);
    }
  };

  const requestLand = async (sellerAddress, landId) => {
    try {
      console.log("Requesting land with params:", {
        sellerAddress,
        landId,
        buyerAddress: account,
      });

      const tx = await contract.requestLand(sellerAddress, landId, {
        gasLimit: 2100000,
      });

      console.log("Transaction submitted:", tx.hash);
      await tx.wait();

      console.log("Transaction confirmed");
      window.location.reload();
    } catch (error) {
      console.error("Error requesting land:", error);

      if (error.reason) {
        alert(`Transaction failed: ${error.reason}`);
      } else if (
        error.message &&
        error.message.includes("execution reverted")
      ) {
        alert(
          "Transaction reverted by the contract. You may not have permission or the land may not be available."
        );
      } else {
        alert("Failed to request land. Check the console for details.");
      }
    }
  };

  const handleLogout = () => {
    // Add any logout logic here if needed (e.g., clearing local storage)
    // Then navigate to login page
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Calculate current lands to display for pagination
  const indexOfLastLand = currentPage * landsPerPage;
  const indexOfFirstLand = indexOfLastLand - landsPerPage;
  const currentLands = landData.slice(indexOfFirstLand, indexOfLastLand);

  const renderLandCard = (land) => (
    <div key={land.id} className="w-full md:w-1/2 lg:w-1/3 p-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg transition duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="relative h-48">
          <img
            src={land.image}
            alt={`Land ${land.id}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold">{land.area} Sq. m.</h3>
            <span className="text-lg font-semibold text-blue-600">
              ₹{ethers.utils.formatEther(land.price)}
            </span>
          </div>

          <h4 className="text-md text-gray-600 mb-3">
            {land.city}, {land.state}
          </h4>

          <div className="mb-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">PID:</span> {land.pid}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Survey No.:</span>{" "}
              {land.surveyNumber}
            </p>
          </div>
        </div>

        <div className="px-5 pb-5">
          {/* Add View on Map button */}
          <div className="mb-3">
            <Link
              to={`/buyerdashboard/${land.originalId}/map`}
              className="w-full flex items-center justify-center py-2 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
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
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              View on Map
            </Link>
          </div>

          {land.isRequested ? (
            <div className="flex items-center justify-center text-green-600 py-2 border-t">
              <svg
                className="h-5 w-5 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Requested</span>
            </div>
          ) : (
            <button
              onClick={() => requestLand(land.owner, land.originalId)}
              disabled={!verified}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                !verified
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              Request Land
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Logout Button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your land properties and requests
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

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Sellers Card */}
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
              <p className="text-blue-100 font-medium">Total Sellers</p>
              <p className="text-3xl font-bold text-white">{sellersCount}</p>
            </div>
          </div>
        </div>

        {/* Registered Lands Card */}
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
              <p className="text-3xl font-bold text-white">{count}</p>
            </div>
          </div>
        </div>

        {/* Total Requests Card */}
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
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-gray-700"
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
              <h5 className="text-lg font-bold text-gray-800 ml-2">Profile</h5>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 mb-4">
              View and manage your profile details
            </p>
            <Link
              to="/buyerdashboard/buyerprofile"
              className="flex items-center justify-between w-full text-blue-600 font-medium py-2 px-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
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
            </Link>
          </div>
        </div>

        {/* Owned Lands Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-gray-700"
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
              <h5 className="text-lg font-bold text-gray-800 ml-2">
                Owned Lands
              </h5>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 mb-4">Access your land portfolio</p>
            <Link
              to="/buyerdashboard/ownedlands"
              className="flex items-center justify-between w-full text-green-600 font-medium py-2 px-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span>View Your Lands</span>
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
            </Link>
          </div>
        </div>

        {/* Make Payment Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <h5 className="text-lg font-bold text-gray-800 ml-2">
                Make Payments
              </h5>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 mb-4">
              Complete payments for approved land requests
            </p>
            <Link
              to="/buyerdashboard/makepayment"
              className="flex items-center justify-between w-full text-purple-600 font-medium py-2 px-4 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <span>Make Payment</span>
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
            </Link>
          </div>
        </div>
      </div>

      {/* Lands Gallery Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-gray-700"
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
            <h4 className="text-lg font-bold text-gray-800 ml-2">
              Available Lands
            </h4>
          </div>
          {!verified && (
            <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              Verification required for requests
            </span>
          )}
        </div>

        <div className="p-5">
          {isLoadingLands ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available lands...</p>
            </div>
          ) : landData.length > 0 ? (
            <>
              <div className="flex flex-wrap -mx-4">
                {currentLands.map(renderLandCard)}
              </div>

              {/* Pagination Controls */}
              {landData.length > landsPerPage && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 mx-1">
                    Page {currentPage} of{" "}
                    {Math.ceil(landData.length / landsPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        prev < Math.ceil(landData.length / landsPerPage)
                          ? prev + 1
                          : prev
                      )
                    }
                    disabled={
                      currentPage >= Math.ceil(landData.length / landsPerPage)
                    }
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                className="h-16 w-16 text-gray-300 mx-auto mb-4"
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
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No available lands
              </h3>
              <p className="text-gray-500">
                Currently there are no lands available for purchase
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

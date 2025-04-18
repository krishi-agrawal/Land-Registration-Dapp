import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const ViewImage = () => {
  // Use separate state variables for better clarity
  const [landCount, setLandCount] = useState(0);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get wallet context
  const {
    account,
    contract,
    isSeller,
    isVerified,
    isRejected,
    loading: walletLoading,
  } = useWallet();

  const navigate = useNavigate();

  // Contract address should be in config
  const contractAddress = "0x20c436af289adc0dbbf05c79caa11612ed20ef27";

  // Get land details helper function
  const getLandDetails = async (contract, id) => {
    const [area, city, state, price, pid, surveyNumber, landImg, document] =
      await Promise.all([
        contract.getArea(id),
        contract.getCity(id),
        contract.getState(id),
        contract.getPrice(id),
        contract.getPID(id),
        contract.getSurveyNumber(id),
        contract.getImage(id),
        contract.getDocument(id),
      ]);

    return {
      id,
      area: area.toString(),
      city,
      state,
      price: ethers.utils.formatEther(price),
      pid: pid.toString(),
      surveyNumber: surveyNumber.toString(),
      image: landImg,
      document,
    };
  };

  // Load land data on component mount or when contract/account changes
  useEffect(() => {
    const loadLandData = async () => {
      if (!contract || !account) {
        return;
      }

      try {
        setLoading(true);

        // Get land count
        const count = await contract.getLandsCount();
        const totalLandCount = parseInt(count.toString());
        setLandCount(totalLandCount);

        // First get all land owners to filter by seller
        const ownerPromises = Array.from({ length: totalLandCount }, (_, i) =>
          contract.getLandOwner(i + 1)
        );

        const owners = await Promise.all(ownerPromises);

        // Filter land IDs owned by the current account
        const ownedLandIds = [];
        for (let i = 0; i < owners.length; i++) {
          if (owners[i].toLowerCase() === account.toLowerCase()) {
            ownedLandIds.push(i + 1); // Adding 1 because IDs start from 1
          }
        }

        // Get details for owned lands in parallel
        const landDetailsPromises = ownedLandIds.map((id) =>
          getLandDetails(contract, id)
        );

        const landsData = await Promise.all(landDetailsPromises);
        setLands(landsData);
      } catch (error) {
        console.error("Failed to load land data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadLandData();
  }, [contract, account]);

  const renderLandCard = (land) => (
    <div key={land.id} className="w-full md:w-1/2 p-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg transition duration-300 hover:shadow-xl">
        <div className="relative">
          <img
            src={land.image}
            alt={`Land ${land.id}`}
            className="w-full h-64 object-cover"
          />
        </div>

        <div className="p-5">
          <span className="text-xs text-blue-500 font-semibold">Photos</span>
          <h3 className="text-2xl font-bold mb-1">{land.area} Sq. m.</h3>
          <h4 className="text-lg text-gray-600 mb-2">
            {land.city}, {land.state}
          </h4>
          <p className="text-gray-700 mb-3">
            PID: {land.pid}
            <br />
            Survey No.: {land.surveyNumber}
          </p>
          <div className="border-t pt-3">
            <p className="text-lg font-semibold">Price: {land.price} ETH</p>
            <p className="mt-2">
              View Verified Land{" "}
              <a
                href={land.document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Document
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (walletLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is verified
  if (!isSeller || !isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600">
            You are not verified to view this page
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Land Gallery</h1>
          <p className="text-gray-600 mt-1">
            View images of your registered properties
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="flex flex-wrap -mx-4">{lands.map(renderLandCard)}</div>

        {/* Empty state - displayed when no lands are available */}
        {lands.length === 0 && !loading && !error && (
          <div className="text-center py-16 px-4">
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
              No land images yet
            </h3>
            <p className="text-gray-500">
              When you register land properties, their images will appear here
            </p>
          </div>
        )}

        {/* Return Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/sellerDashboard")}
            className="inline-flex items-center justify-center py-2.5 px-6 rounded-lg font-medium shadow-sm bg-blue-500 hover:bg-blue-600 text-white transition-colors"
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
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewImage;

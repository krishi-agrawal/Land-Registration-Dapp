import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json";
import { Link, useNavigate } from "react-router-dom";

const ViewImage = () => {
  // Combined state
  const [state, setState] = useState({
    provider: null,
    signer: null,
    account: null,
    contract: null,
    verified: false,
    registered: false,
    landCount: 0,
    lands: [],
    loading: true,
    error: null,
  });

  const navigate = useNavigate();

  // Contract address should be in config
  const contractAddress = "0x273d42dE3e74907cD70739f58DC717dF2872F736";

  // Initialize provider and connect wallet
  useEffect(() => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const init = async () => {
      try {
        const ethersProvider = new ethers.providers.Web3Provider(
          window.ethereum
        );
        await connectWallet(ethersProvider);
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    };

    init();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const connectWallet = async (provider) => {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        Registry.abi,
        signer
      );

      setState((prev) => ({
        ...prev,
        provider,
        signer,
        account: accounts[0],
        contract,
      }));

      await loadLandData(contract, accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const loadLandData = async (contract, address) => {
    try {
      const [isVerified, count] = await Promise.all([
        contract.isVerified(address),
        contract.getLandsCount(),
      ]);

      const landCount = parseInt(count.toString());

      // Fetch all lands data in parallel
      const landPromises = [];
      for (let i = 1; i <= landCount; i++) {
        const seller = await contract.getLandOwner(i);
        if (seller.toLowerCase() === address.toLowerCase())
          landPromises.push(getLandDetails(contract, i));
      }

      const lands = await Promise.all(landPromises);

      setState((prev) => ({
        ...prev,
        verified: isVerified,
        registered: true,
        landCount,
        lands,
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to load land data:", error);
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  };

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
            <p className="text-lg font-semibold">Price: ₹ {land.price}</p>
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

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>Error: {state.error}</p>
        </div>
      </div>
    );
  }

  if (!state.registered || !state.verified) {
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
      <p className="text-gray-600 mt-1">View images of your registered properties</p>
    </div>
    
    {/* Gallery Grid */}
    <div className="flex flex-wrap -mx-4">
      {state.lands.map(renderLandCard)}
    </div>
    
    {/* Empty state - displayed when no lands are available */}
    {state.lands.length === 0 && (
      <div className="text-center py-16 px-4">
        <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No land images yet</h3>
        <p className="text-gray-500">When you register land properties, their images will appear here</p>
      </div>
    )}
    
    {/* Return Button */}
    <div className="mt-8 text-center">
      <button
        onClick={() => state.verified && (window.location.href = "/sellerDashboard")}
        className={`inline-flex items-center justify-center py-2.5 px-6 rounded-lg font-medium shadow-sm ${
          state.verified
            ? "bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!state.verified}
      >
        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        Return to Dashboard
      </button>
    </div>
  </div>
</div>
  );
};

export default ViewImage;

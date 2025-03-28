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
          <div className="absolute top-0 left-0 bg-blue-500 text-white font-bold py-1 px-3 rounded-br-lg z-10">
            {land.id}
          </div>
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
                href={`https://ipfs.io/ipfs/${land.document}`}
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap -mx-4">
        {state.lands.map(renderLandCard)}
      </div>
      <Link
        to="/sellerDashboard"
        className={`block text-center py-2 px-4 rounded w-2/3 mx-auto ${
          state.verified
            ? "bg-blue-500 hover:bg-blue-700 text-white transition duration-300"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        onClick={(e) => !state.verified && e.preventDefault()}
      >
        Return to Seller Dashboard
      </Link>
    </div>
  );
};

export default ViewImage;

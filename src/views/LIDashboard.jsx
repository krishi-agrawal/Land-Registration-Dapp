import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Land from "../../artifacts/contracts/Registry.sol/Registry.json";

const LIDashboard = () => {
  const [landContract, setLandContract] = useState(null);
  const [account, setAccount] = useState(null);

  const [signer, setSigner] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sellersCount, setSellersCount] = useState(0);
  const [buyersCount, setBuyersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  const navigate = useNavigate();

  // Connect wallet function
  const connectWallet = async (provider) => {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const ethersSigner = provider.getSigner();
      setSigner(ethersSigner);
      setAccount(accounts[0]);

      // Use specific contract address
      const contractInstance = new ethers.Contract(
        "0x273d42dE3e74907cD70739f58DC717dF2872F736", // Contract address
        Land.abi,
        ethersSigner
      );

      console.log("Contract Inst: ", contractInstance);
      setLandContract(contractInstance);

      // Check if current user is a land inspector
      const verificationStatus = await contractInstance.isLandInspector(
        accounts[0]
      );
      setIsVerified(verificationStatus);

      // Get counts
      const sellerCount = await contractInstance.getSellersCount();
      const buyerCount = await contractInstance.getBuyersCount();
      const reqCount = await contractInstance.getRequestsCount();

      setSellersCount(parseInt(sellerCount.toString()));
      setBuyersCount(parseInt(buyerCount.toString()));
      setRequestsCount(parseInt(reqCount.toString()));

      setIsLoading(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Check console for details.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // For refreshing page only once

    if (!localStorage.getItem("pageLoaded")) {
      localStorage.setItem("pageLoaded", "true");
      window.location.reload();
    }

    // Initialize provider and connect wallet
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

      connectWallet(ethersProvider);
    } else {
      alert("Please install MetaMask!");
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600">
            You are not verified to view this page
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
  {/* Header */}
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-800">Land Inspector Dashboard</h1>
    <p className="text-gray-600 mt-1">Manage property transactions and user verifications</p>
  </div>
  
  {/* Stats Cards */}
  <div className="mb-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Buyers Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
        <div className="p-6 flex items-center">
          <div className="bg-white/20 p-3 rounded-lg">
            <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-blue-100 font-medium">Total Buyers</p>
            <p className="text-3xl font-bold text-white">{buyersCount}</p>
          </div>
        </div>
      </div>

      {/* Requests Card */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
        <div className="p-6 flex items-center">
          <div className="bg-white/20 p-3 rounded-lg">
            <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-indigo-100 font-medium">Total Requests</p>
            <p className="text-3xl font-bold text-white">{requestsCount}</p>
          </div>
        </div>
      </div>

      {/* Sellers Card */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
        <div className="p-6 flex items-center">
          <div className="bg-white/20 p-3 rounded-lg">
            <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-orange-100 font-medium">Total Sellers</p>
            <p className="text-3xl font-bold text-white">{sellersCount}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Action Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Buyers Information Card */}
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h5 className="text-lg font-bold text-gray-800">Buyers Information</h5>
        </div>
      </div>
      <div className="p-5">
        <p className="text-gray-600 mb-4">Review and verify buyer registrations and credentials</p>
        <button
          onClick={() => navigate("/LIdashboard/BuyerInfo")}
          className="flex items-center justify-between w-full text-white font-medium py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow transition-colors"
        >
          <span>Verify Buyers</span>
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>

    {/* Land Transfer Requests Card */}
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h5 className="text-lg font-bold text-gray-800">Land Transfers</h5>
        </div>
      </div>
      <div className="p-5">
        <p className="text-gray-600 mb-4">Review and approve property transfer transactions</p>
        <button
          onClick={() => navigate("/LIdashboard/TransactionInfo")}
          className="flex items-center justify-between w-full text-white font-medium py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-sm hover:shadow transition-colors"
        >
          <span>Approve Transactions</span>
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>

    {/* Sellers Information Card */}
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h5 className="text-lg font-bold text-gray-800">Sellers Information</h5>
        </div>
      </div>
      <div className="p-5">
        <p className="text-gray-600 mb-4">Review and verify seller registrations and credentials</p>
        <button
          onClick={() => navigate("/LIdashboard/SellerInfo")}
          className="flex items-center justify-between w-full text-white font-medium py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-sm hover:shadow transition-colors"
        >
          <span>Verify Sellers</span>
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default LIDashboard;

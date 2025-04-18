import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BuyerInfo = () => {
  const navigate = useNavigate();

  // Use wallet context for wallet-related state
  const {
    account,
    contract: landContract,
    isLandInspector: isInspector,
    loading: walletLoading,
  } = useWallet();
  const [loading, setLoading] = useState(true);
  const [processingTx, setProcessingTx] = useState(false);
  const [buyersList, setBuyersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Load all buyer data - defined as a useCallback to avoid recreation on each render
  const loadBuyerData = useCallback(async (contract) => {
    if (!contract) return;
    
    try {
      setLoading(true);

      // Get total buyers count
      let buyersCount = await contract.buyersCount();
      console.log("Buyers count:", buyersCount.toString());

      // Create array to store buyer info
      const buyers = [];

      // Loop through each buyer index to get the address first
      for (let i = 0; i < buyersCount; i++) {
        try {
          // Get buyer address from the buyers array using the auto-generated getter
          const address = await contract.buyers(i);

          // Get buyer details, verification status, and rejection status
          const [buyerDetails, isVerified, isRejected] = await Promise.all([
            contract.BuyerMapping(address),
            contract.BuyerVerification(address),
            contract.BuyerRejection(address),
          ]);

          // Format buyer data
          buyers.push({
            id: i + 1,
            address: address,
            name: buyerDetails.name,
            age: buyerDetails.age.toNumber(),
            city: buyerDetails.city,
            aadharNumber: buyerDetails.aadharNumber,
            panNumber: buyerDetails.panNumber,
            document: buyerDetails.document,
            email: buyerDetails.email,
            isVerified: isVerified,
            isRejected: isRejected,
          });
        } catch (err) {
          console.error(`Error processing buyer at index ${i}:`, err);
        }
      }

      setBuyersList(buyers);
    } catch (error) {
      console.error("Error loading buyer data:", error);
      toast.error("Failed to load buyer information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (landContract) {
      loadBuyerData(landContract);
    }
  }, [landContract, loadBuyerData]);

  // Verify a buyer
  const verifyBuyer = async (address) => {
    try {
      setProcessingTx(true);
      console.log("Verifying buyer with address:", address);
      
      const tx = await landContract.verifyBuyer(address, {
        from: account,
        gasLimit: 2100000
      });
      
      toast.info("Verification transaction submitted. Please wait for confirmation...");

      // Wait for transaction to be mined
      await tx.wait();
      toast.success("Buyer verified successfully!");

      // Reload buyer data
      await loadBuyerData(landContract);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify buyer: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setProcessingTx(false);
    }
  };

  // Reject a buyer
  const rejectBuyer = async (address) => {
    try {
      setProcessingTx(true);
      console.log("Rejecting buyer with address:", address);
      
      const tx = await landContract.rejectBuyer(address, {
        from: account,
        gasLimit: 210000,
      });
      
      toast.info("Rejection transaction submitted. Please wait for confirmation...");

      // Wait for transaction to be mined
      await tx.wait();
      toast.success("Buyer rejected successfully!");

      // Reload buyer data
      await loadBuyerData(landContract);
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject buyer: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setProcessingTx(false);
    }
  };

  // Filter buyers based on search term and filter selection
  const filteredBuyers = buyersList.filter(buyer => {
    const matchesSearch = searchTerm === "" || 
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.aadharNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.panNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && !buyer.isVerified && !buyer.isRejected;
    if (filter === "verified") return matchesSearch && buyer.isVerified;
    if (filter === "rejected") return matchesSearch && buyer.isRejected;
    
    return matchesSearch;
  });

  // Loading state
  if (walletLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading buyer information...</p>
        </div>
      </div>
    );
  }

  // Not authorized view
  if (!isInspector) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-red-600 px-6 py-4 flex items-center">
            <div className="mr-4 bg-white rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Access Denied</h1>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-6">
              You are not verified to view this page. Only verified Land
              Inspectors can access the buyer verification dashboard.
            </p>
            <button 
              onClick={() => navigate("/")}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content - Buyer table
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Processing overlay */}
      {processingTx && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-xl font-semibold text-gray-800">
              Processing transaction...
            </p>
            <p className="mt-2 text-gray-600">
              Please wait while the blockchain confirms your action.
            </p>
            <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white">
                Buyer Verification Dashboard
              </h1>
              <p className="mt-2 text-blue-100">
                Verify or reject buyer applications for the land registration system.
              </p>
            </div>
            
            
            {/* Profile Badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-3 self-start md:self-auto">
              <div className="bg-blue-600 h-8 w-8 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Land Inspector</p>
                <p className="text-blue-200 text-xs">{account && `${account.slice(0, 6)}...${account.slice(-4)}`}</p>
              </div>
            {/* Return to Dashboard Button */}
            <button
              onClick={() => navigate('/LIDashboard')}
              className="flex items-center text-white bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Return to Dashboard
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
            <div className="p-6 flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Buyers</p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-800">
                    {buyersList.length}
                  </p>
                  <p className="ml-2 text-sm text-gray-500">registered users</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 px-6 py-2">
              <div className="text-xs font-medium text-blue-600 uppercase">All buyer applications</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
            <div className="p-6 flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Verified Buyers
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-800">
                    {buyersList.filter((buyer) => buyer.isVerified).length}
                  </p>
                  <p className="ml-2 text-sm text-gray-500">approved</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 px-6 py-2">
              <div className="text-xs font-medium text-green-600 uppercase">Verified and active</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
            <div className="p-6 flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Verification
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-800">
                    {
                      buyersList.filter(
                        (buyer) => !buyer.isVerified && !buyer.isRejected
                      ).length
                    }
                  </p>
                  <p className="ml-2 text-sm text-gray-500">awaiting review</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 px-6 py-2">
              <div className="text-xs font-medium text-yellow-600 uppercase">Requires your attention</div>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-8 flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            All Buyers
          </button>
          <button 
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            Pending Verification
          </button>
          <button 
            onClick={() => setFilter("verified")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "verified"
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            Verified Buyers
          </button>
          <button 
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "rejected"
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            Rejected Applications
          </button>
          
          <div className="ml-auto mt-2 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Buyers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800">
                Buyers Information
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredBuyers.length} of {buyersList.length} entries
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aadhar Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pan Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuyers.length > 0 ? (
                  filteredBuyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {buyer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium text-xs">{buyer.address.slice(0, 2)}</span>
                          </div>
                          <span className="font-mono">
                            {buyer.address.slice(0, 6) +
                              "..." +
                              buyer.address.slice(-4)}
                          </span>
                          <button
                            className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(buyer.address);
                              toast.success("Address copied to clipboard!");
                            }}
                            title="Copy address"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{buyer.name}</div>
                        <div className="text-xs text-gray-500">Buyer</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {buyer.age.toString()} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {buyer.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={`mailto:${buyer.email}`} className="text-blue-600 hover:underline">
                          {buyer.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {buyer.aadharNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {buyer.panNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a
                          href={buyer.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Document
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {buyer.isVerified ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : buyer.isRejected ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => verifyBuyer(buyer.address)}
                            disabled={buyer.isVerified || buyer.isRejected}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors ${
                              buyer.isVerified || buyer.isRejected
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verify
                          </button>
                          <button
                            onClick={() => rejectBuyer(buyer.address)}
                            disabled={buyer.isVerified || buyer.isRejected}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors ${
                              buyer.isVerified || buyer.isRejected
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-6 py-10 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium text-gray-400">
                        {searchTerm || filter !== "all" 
                          ? "No buyers match your search criteria" 
                          : "No buyers registered yet"}
                      </p>
                      <p className="text-gray-400 mt-1">
                        {searchTerm || filter !== "all" 
                          ? "Try adjusting your search or filter" 
                          : "New buyer registrations will appear here"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination - Only show if there are items */}
          {filteredBuyers.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">1</span> to <span className="font-semibold">{filteredBuyers.length}</span> of{" "}
                <span className="font-semibold">{filteredBuyers.length}</span> results
              </div>
              <div className="flex-1 flex justify-between sm:justify-end">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  Previous
                </button>
                <button
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => loadBuyerData(landContract)}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerInfo;
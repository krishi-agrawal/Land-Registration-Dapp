import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import Land from "../../artifacts/contracts/Registry.sol/Registry.json";

const BuyerProfile = () => {
  // States
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [verified, setVerified] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Using your provided MetaMask auth code
  useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      connectWallet(ethersProvider);
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async (ethersProvider) => {
    try {
      const accounts = await ethersProvider.send("eth_requestAccounts", []);
      const ethersSigner = ethersProvider.getSigner();
      setSigner(ethersSigner);
      setAccount(accounts[0]);

      const contractInstance = new ethers.Contract(
        "0x273d42dE3e74907cD70739f58DC717dF2872F736", // Using the contract address from your code
        Land.abi,
        ethersSigner
      );
      setContract(contractInstance);

      // Load buyer data after contract is initialized
      await loadBuyerData(contractInstance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  // For refreshing page only once
  useEffect(() => {
    if (!localStorage.getItem("pageLoaded")) {
      localStorage.setItem("pageLoaded", "true");
      window.location.reload();
    }
  }, []);

  const loadBuyerData = async (contractInstance, currentAddress) => {
    try {
      // Check verification status
      const isVerified = await contractInstance.isVerified(currentAddress);
      setVerified(isVerified);

      const isRejected = await contractInstance.isRejected(currentAddress);
      setRejected(isRejected);

      // Get buyer details
      const buyerDetails = await contractInstance.getBuyerDetails(
        currentAddress
      );
      console.log("Buyer details:", buyerDetails);

      setBuyer({
        name: buyerDetails[0],
        city: buyerDetails[1],
        panNumber: buyerDetails[2],
        document: buyerDetails[3],
        email: buyerDetails[4],
        age: buyerDetails[5],
        aadharNumber: buyerDetails[6],
        walletAddress: currentAddress,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading buyer data:", error);
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get verification status UI element
  const getVerificationStatus = () => {
    if (verified) {
      return (
        <p className="text-green-600 font-semibold">
          Verified <i className="fas fa-user-check"></i>
        </p>
      );
    } else if (rejected) {
      return (
        <p className="text-red-600 font-semibold">
          Rejected <i className="fas fa-user-times"></i>
        </p>
      );
    } else {
      return (
        <p className="text-yellow-600 font-semibold">
          Not Yet Verified <i className="fas fa-user-cog"></i>
        </p>
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
  <div className="max-w-3xl mx-auto">
    {/* Header */}
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">Profile Details</h1>
      <p className="text-gray-600 mt-1">View and manage your personal information</p>
    </div>
    
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h5 className="text-xl font-bold text-gray-800">Buyer Profile</h5>
        </div>
        <div className="verification-status">{getVerificationStatus()}</div>
      </div>

      <div className="p-6">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Your Wallet Address
              </label>
              <div className="flex">
                <input
                  disabled
                  type="text"
                  value={buyer?.walletAddress}
                  className="flex-grow shadow-sm border border-gray-200 rounded-lg py-2.5 px-4 text-gray-700 font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  type="button" 
                  className="ml-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                  title="Copy address"
                  onClick={() => {
                    navigator.clipboard.writeText(buyer?.walletAddress);
                  }}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Name
              </label>
              <input
                disabled
                type="text"
                value={buyer?.name}
                className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Age
              </label>
              <input
                disabled
                type="text"
                value={buyer?.age}
                className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                disabled
                type="text"
                value={buyer?.email}
                className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                City
              </label>
              <input
                disabled
                type="text"
                value={buyer?.city}
                className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Aadhar Number
              </label>
              <input
                disabled
                type="text"
                value={buyer?.aadharNumber}
                className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                PAN Number
              </label>
              <input
                disabled
                type="text"
                value={buyer?.panNumber}
                className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Your Aadhar Document
              </label>
              <button
                type="button"
                onClick={() => window.open(`https://ipfs.io/ipfs/${buyer?.document}`, '_blank')}
                className="inline-flex items-center px-4 py-2 border border-blue-200 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Document
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => {
                if (verified) {
                  // Use your navigation method here, e.g.:
                  // navigate('/buyerdashboard/updateBuyer')
                  // or history.push('/buyerdashboard/updateBuyer')
                  window.location.href = '/buyerdashboard/updateBuyer';
                }
              }}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                verified 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow transition-all" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
  );
};

export default BuyerProfile;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";

const BuyerProfile = () => {
  // States
  const {
    account,
    contract,
    isBuyer: registered,
    isVerified: verified,
    isRejected: rejected,
    loading,
  } = useWallet();
  const [buyer, setBuyer] = useState();
  const [isLoading, setIsLoading] = useState(true);
  // Using your provided MetaMask auth code
  useEffect(() => {
    const loadBuyerData = async (contractInstance, currentAddress) => {
      try {
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
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading buyer data:", error);
      }
    };
    if (contract && account) loadBuyerData(contract, account);
  }, [contract, account]);

  // Loading state
  if (isLoading) {
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
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <svg
            className="h-4 w-4 mr-1"
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
          Verified
        </span>
      );
    } else if (rejected) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <svg
            className="h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
          <svg
            className="h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Pending Verification
        </span>
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Profile Details</h1>
          <p className="text-gray-600 mt-1">
            View and manage your personal information
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
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
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
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
                  <a
                    href={buyer?.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-blue-200 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    View Document
                  </a>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (verified) {
                      window.location.href = "/buyerdashboard/updateBuyer";
                    }
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                    verified
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow transition-all"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
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

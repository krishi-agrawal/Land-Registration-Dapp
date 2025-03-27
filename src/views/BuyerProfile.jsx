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
      connectWallet();
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        const ethersSigner = provider.getSigner();
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
    }
  };

  // For refreshing page only once
  useEffect(() => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h5 className="text-xl font-bold text-gray-800">Buyer Profile</h5>
            <div className="verification-status">{getVerificationStatus()}</div>
          </div>

          <div className="p-6">
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Your Wallet Address:
                </label>
                <input
                  disabled
                  type="text"
                  value={buyer?.walletAddress}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  disabled
                  type="text"
                  value={buyer?.name}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Age
                </label>
                <input
                  disabled
                  type="text"
                  value={buyer?.age}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email Address
                </label>
                <input
                  disabled
                  type="text"
                  value={buyer?.email}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  City
                </label>
                <input
                  disabled
                  type="text"
                  value={buyer?.city}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Aadhar Number
                </label>
                <input
                  disabled
                  type="text"
                  value={buyer?.aadharNumber}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pan Number
                </label>
                <input
                  disabled
                  type="text"
                  value={buyer?.panNumber}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Your Aadhar Document
                </label>
                <div className="text-blue-500">
                  <a
                    href={`https://ipfs.io/ipfs/${buyer?.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Here
                  </a>
                </div>
              </div>

              <Link
                to="/updateBuyer"
                className={`py-2 px-4 rounded font-medium ${
                  verified
                    ? "bg-blue-500 hover:bg-blue-700 text-white transition duration-300"
                    : "bg-gray-300 text-gray-500"
                }`}
                onClick={(e) => !verified && e.preventDefault()}
              >
                Edit Profile
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;

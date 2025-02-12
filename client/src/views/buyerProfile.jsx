import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Land from "../artifacts/Land.json";
import { Spinner } from "react-bootstrap";

const BuyerProfile = () => {
  const [landInstance, setLandInstance] = useState(null);
  const [account, setAccount] = useState("Loading...");
  const [buyerDetails, setBuyerDetails] = useState(null);
  const [verified, setVerified] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          setError("MetaMask not found. Please install it.");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const network = await provider.getNetwork();
        const deployedNetwork = Land.networks[network.chainId];
        if (!deployedNetwork || !deployedNetwork.address) {
          setError("Contract not deployed on this network.");
          return;
        }

        const instance = new ethers.Contract(deployedNetwork.address, Land.abi, signer);
        setLandInstance(instance);

        const buyer = await instance.getBuyerDetails(address);
        setBuyerDetails(buyer);

        const isVerified = await instance.isVerified(address);
        const isRejected = await instance.isRejected(address);
        setVerified(isVerified);
        setRejected(isRejected);
      } catch (error) {
        console.error("Error initializing:", error);
        setError("Failed to load data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white">Buyer Profile</h2>
            <div className="mt-2">
              {verified ? (
                <p className="text-green-300 font-semibold">Verified</p>
              ) : rejected ? (
                <p className="text-red-300 font-semibold">Rejected</p>
              ) : (
                <p className="text-yellow-300 font-semibold">Not Yet Verified</p>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Wallet Address</label>
                <input disabled type="text" value={account} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input disabled type="text" value={buyerDetails?.[0] || "N/A"} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input disabled type="text" value={buyerDetails?.[5] || "N/A"} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input disabled type="text" value={buyerDetails?.[4] || "N/A"} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input disabled type="text" value={buyerDetails?.[1] || "N/A"} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                <input disabled type="text" value={buyerDetails?.[6] || "N/A"} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pan Number</label>
                <input disabled type="text" value={buyerDetails?.[2] || "N/A"} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Aadhar Document</label>
                {buyerDetails?.[3] ? (
                  <a
                    href={`https://ipfs.io/ipfs/${buyerDetails[3]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Document
                  </a>
                ) : (
                  <p className="text-gray-500">No document available</p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => (window.location.href = "/admin/updateBuyer")}
                disabled={!verified}
                className={`px-4 py-2 rounded ${!verified ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"} text-white font-bold`}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const UpdateSeller = () => {
  // States
  const {
    account,
    contract,
    isSeller: registered,
    isVerified: verified,
    isRejected: rejected,
    loading: walletLoading,
  } = useWallet();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // MetaMask connection
  useEffect(() => {
    const loadSellerData = async (contractInstance, currentAddress) => {
      try {
        // Get seller details
        const sellerDetails = await contractInstance.getSellerDetails(
          currentAddress
        );
        console.log("Seller details:", sellerDetails);

        // Update state with seller details
        setName(sellerDetails[0]);
        setAge(sellerDetails[1]);
        setAadharNumber(sellerDetails[2]);
        setPanNumber(sellerDetails[3]);

        setLoading(false);
      } catch (error) {
        console.error("Error loading seller data:", error);
        setLoading(false);
      }
    };
    if (contract && account) loadSellerData(contract, account);
  }, [contract, account]);

  const updateSeller = async () => {
    if (name === "" || age === "" || aadharNumber === "" || panNumber === "") {
      alert("All the fields are compulsory!");
    } else if (aadharNumber.length !== 12) {
      alert("Aadhar Number should be 12 digits long!");
    } else if (panNumber.length !== 10) {
      alert("Pan Number should be 10 digit alphanumeric number");
    } else if (!Number(age)) {
      alert("Your age must be a number");
    } else {
      try {
        const tx = await contract.updateSeller(
          name,
          age,
          aadharNumber,
          panNumber
        );

        await tx.wait();

        // Navigate to profile after successful update
        navigate("/sellerdashboard/sellerprofile");

        // Reload the page
        window.location.reload();
      } catch (error) {
        console.error("Error updating seller:", error);
        alert("Failed to update seller profile. See console for details.");
      }
    }
  };

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

  // Loading state
  if (walletLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h5 className="text-xl font-bold text-gray-800">
              Update Seller Profile
            </h5>
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
                  value={account}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Age
                </label>
                <input
                  disabled
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
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
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pan Number
                </label>
                <input
                  disabled
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/sellerdashboard/sellerprofile")}
                  className="py-2 px-4 bg-gray-500 hover:bg-gray-700 text-white font-medium rounded transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) =>
                    !verified ? e.preventDefault() : updateSeller()
                  }
                  className={`py-2 px-4 rounded font-medium ${
                    verified
                      ? "bg-blue-500 hover:bg-blue-700 text-white transition duration-300"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateSeller;

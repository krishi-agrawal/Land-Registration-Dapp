import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const UpdateBuyer = () => {
  const {
    account: address,
    contract,
    isVerified: verified,
    isRejected: rejected,
    loading: walletLoading,
  } = useWallet();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadBuyerData = async () => {
      if (!contract || !address) return;

      try {
        const buyer = await contract.getBuyerDetails(address);
        setName(buyer[0]);
        setCity(buyer[1]);
        setPanNumber(buyer[2]);
        setEmail(buyer[4]);
        setAge(buyer[5]);
        setAadharNumber(buyer[6]);
      } catch (error) {
        console.error("Error loading buyer data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBuyerData();
  }, [contract, address]);

  const updateBuyer = async () => {
    if (
      name === "" ||
      age === "" ||
      city === "" ||
      email === "" ||
      aadharNumber === "" ||
      panNumber === ""
    ) {
      alert("All the fields are compulsory!");
    } else if (aadharNumber.length !== 12) {
      alert("Aadhar Number should be 12 digits long!");
    } else if (panNumber.length !== 10) {
      alert("Pan Number should be 10 digit alphanumeric number");
    } else if (!Number(age)) {
      alert("Your age must be a number");
    } else {
      try {
        const tx = await contract.updateBuyer(
          name,
          age,
          city,
          aadharNumber,
          email,
          panNumber
        );
        await tx.wait();
        navigate("/buyerdashboard/buyerprofile");
        window.location.reload();
      } catch (error) {
        console.error("Error updating buyer:", error);
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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-600 mt-1">Update your personal information</p>
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <h5 className="text-xl font-bold text-gray-800">
                Update Profile
              </h5>
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
                      value={address}
                      className="flex-grow shadow-sm border border-gray-200 rounded-lg py-2.5 px-4 text-gray-700 font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="ml-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                      title="Copy address"
                      onClick={() => navigator.clipboard.writeText(address)}
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
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Age
                  </label>
                  <input
                    disabled
                    type="text"
                    value={age}
                    className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Age cannot be modified after registration
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Aadhar Number
                  </label>
                  <input
                    disabled
                    type="text"
                    value={aadharNumber}
                    className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Aadhar number cannot be modified
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    PAN Number
                  </label>
                  <input
                    disabled
                    type="text"
                    value={panNumber}
                    className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PAN number cannot be modified
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6 flex justify-between">
                <Link
                  to="/buyerdashboard/buyerprofile"
                  className="inline-flex items-center px-4 py-2 rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
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
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={(e) =>
                    !verified ? e.preventDefault() : updateBuyer()
                  }
                  className={`inline-flex items-center px-6 py-2 rounded-lg font-medium ${
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBuyer;

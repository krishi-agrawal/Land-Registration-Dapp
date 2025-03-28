import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json";

// Keep global arrays as in original
let row = [];
let countarr = [];
let userarr = [];
let reqsarr = [];

const SDash = () => {
  // States
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [verified, setVerified] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [landsCount, setLandsCount] = useState(0);
  const [buyersCount, setBuyersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [lands, setLands] = useState([]);

  const navigate = useNavigate();

  const viewImage = (landId) => {
    alert(landId);
    navigate("/viewImage");
  };

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
        "0x273d42dE3e74907cD70739f58DC717dF2872F736",
        Registry.abi,
        ethersSigner
      );
      setContract(contractInstance);

      // Now that we have the contract instance, load the data
      loadContractData(contractInstance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // For refreshing page only once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
  }, []);

  const loadContractData = async (contractInstance, currentAccount) => {
    try {
      console.log("Connected account:", currentAccount);
      console.log("Contract initialized:", contractInstance.address);

      // Reset global arrays
      row = [];
      countarr = [];
      userarr = [];
      reqsarr = [];

      // Check if user is verified
      const isVerified = await contractInstance.isVerified(currentAccount);
      console.log("Is verified:", isVerified);
      setVerified(isVerified);

      // Check if user is a registered seller
      const isSeller = await contractInstance.isSeller(currentAccount);
      console.log("Is registered seller:", isSeller);
      setRegistered(isSeller);

      // Get counts
      const landsTotal = await contractInstance.getLandsCount();
      const buyersTotal = await contractInstance.buyersCount();
      const requestsTotal = await contractInstance.requestsCount();

      setLandsCount(landsTotal.toNumber());
      console.log("Landtotal: ", landsTotal.toNumber());
      setBuyersCount(buyersTotal.toNumber());
      setRequestsCount(requestsTotal.toNumber());

      countarr.push(landsTotal.toString());
      userarr.push(buyersTotal.toString());
      reqsarr.push(requestsTotal.toString());

      // Get lands data
      const landsData = [];
      const count = landsTotal.toNumber();

      // Get land details
      for (let i = 1; i <= count; i++) {
        try {
          const land = await contractInstance.lands(i);

          landsData.push({
            id: i,
            area: land.area.toString(),
            city: land.city,
            state: land.state,
            price: land.landPrice.toString(),
            propertyPID: land.propertyPID.toString(),
            surveyNumber: land.physicalSurveyNumber.toString(),
          });
        } catch (error) {
          console.error(`Error fetching land ${i}:`, error);
        }
      }

      setLands(landsData);
      setLoading(false);
    } catch (error) {
      console.error("Initialization error:", error);
      alert("Failed to load contract or accounts. Check console for details.");
      setLoading(false);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show message if not registered seller
  if (!registered) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center text-red-600">
              You are not verified to view this page
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Buyers Card */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg shadow-md overflow-hidden text-white">
          <div className="p-6 text-center">
            <div className="text-5xl mb-2">
              <i className="fa fa-users"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">Total Buyers</h2>
            <p className="text-3xl font-bold">{buyersCount}</p>
          </div>
        </div>

        {/* Lands Card */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg shadow-md overflow-hidden text-white">
          <div className="p-6 text-center">
            <div className="text-5xl mb-2">
              <i className="fa fa-landmark"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">Registered Lands</h2>
            <p className="text-3xl font-bold">{landsCount}</p>
          </div>
        </div>

        {/* Requests Card */}
        <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-lg shadow-md overflow-hidden text-white">
          <div className="p-6 text-center">
            <div className="text-5xl mb-2">
              <i className="fa fa-bell"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">Total Requests</h2>
            <p className="text-3xl font-bold">{requestsCount}</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Add Land Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h5 className="text-xl font-semibold text-gray-800">
              Wish to Add Land!
            </h5>
          </div>
          <div className="p-5">
            <Link
              to="/sellerdashboard/addland"
              className={`block text-center py-2 px-4 rounded ${
                verified
                  ? "bg-blue-500 hover:bg-blue-700 text-white transition duration-300"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={(e) => !verified && e.preventDefault()}
            >
              Add Land
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h5 className="text-xl font-semibold text-gray-800">Profile</h5>
          </div>
          <div className="p-5">
            <Link
              to="/sellerdashboard/sellerprofile"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center transition duration-300"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Requests Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h5 className="text-xl font-semibold text-gray-800">Requests</h5>
          </div>
          <div className="p-5">
            <Link
              to="/sellerdashboard/approverequest"
              className={`block text-center py-2 px-4 rounded ${
                verified
                  ? "bg-blue-500 hover:bg-blue-700 text-white transition duration-300"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={(e) => !verified && e.preventDefault()}
            >
              View all Land Requests
            </Link>
          </div>
        </div>
      </div>

      {/* Lands Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-200">
          <h4 className="text-xl font-semibold text-gray-800">Lands Info</h4>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property PID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Survey Number
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lands.map((land) => (
                <tr key={land.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{land.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.area}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {land.propertyPID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {land.surveyNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Images Card */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h5 className="text-xl font-semibold text-gray-800">
            View Images of all Lands!
          </h5>
        </div>
        <div className="p-5">
          <Link
            to="/SellerdashBoard/viewimage"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center transition duration-300"
          >
            View Images
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SDash;

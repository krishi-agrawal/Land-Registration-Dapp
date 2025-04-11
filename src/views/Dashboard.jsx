import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json";

const Dashboard = () => {
  const navigate = useNavigate();

  // States
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [verified, setVerified] = useState(false);
  const [count, setCount] = useState(0);
  const [sellersCount, setSellersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Using your provided MetaMask auth code
  useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      connectWallet(ethersProvider); // Pass provider directly here
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
        Registry.abi,
        ethersSigner
      );
      setContract(contractInstance);

      // Continue with loading contract data after connecting wallet
      loadContractData(contractInstance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  // For refreshing page only once (keeping original functionality)
  useEffect(() => {
    if (!localStorage.getItem("pageLoaded")) {
      localStorage.setItem("pageLoaded", "true");
      window.location.reload();
    }
  }, []);

  const loadContractData = async (contractInstance, currentAccount) => {
    try {
      // Check if user is registered and verified
      const isRegistered = await contractInstance.isBuyer(currentAccount);
      setRegistered(isRegistered);

      const isVerified = await contractInstance.isVerified(currentAccount);
      setVerified(isVerified);

      // Get counts
      const landsCount = await contractInstance.getLandsCount();
      setCount(parseInt(landsCount.toString()));

      const sellerCount = await contractInstance.getSellersCount();
      setSellersCount(parseInt(sellerCount.toString()));

      const reqCount = await contractInstance.getRequestsCount();
      setRequestsCount(parseInt(reqCount.toString()));

      // Load land data
      await loadLandData(contractInstance, parseInt(landsCount.toString()));

      setLoading(false);
    } catch (error) {
      console.error("Error loading contract data:", error);
      setLoading(false);
    }
  };

  const loadLandData = async (contractInstance, count) => {
    try {
      const lands = [];

      // Get all land owners

      let idx = 0;
      // Get land details
      for (let i = 1; i <= count; i++) {
        const isRequested = await contractInstance.isRequested(i);
        if (!isRequested) {
          idx++;
          const land = await contractInstance.lands(i);

          const owner = await contractInstance.getLandOwner(i);

          lands.push({
            id: idx,
            originalId: i,
            area: land.area.toString(),
            city: land.city,
            state: land.state,
            price: land.landPrice.toString(),
            pid: land.propertyPID.toString(),
            surveyNumber: land.physicalSurveyNumber.toString(),
            owner,
            isRequested,
          });
        }
      }

      setLandData(lands);
    } catch (error) {
      console.error("Error loading land data:", error);
    }
  };

  const requestLand = async (sellerAddress, landId) => {
    try {
      // Add logging to debug the parameters
      console.log("Requesting land with params:", {
        sellerAddress,
        landId,
        buyerAddress: account,
      });
      console.log("isbuyer: ", registered);

      // Try setting a manual gas limit to bypass the estimation error
      const tx = await contract.requestLand(sellerAddress, landId, {
        gasLimit: 300000, // Set a reasonable gas limit manually
      });

      console.log("Transaction submitted:", tx.hash);
      await tx.wait();

      console.log("Transaction confirmed");
      // Reload the page after transaction is confirmed
      window.location.reload();
    } catch (error) {
      console.error("Error requesting land:", error);

      // More detailed error reporting
      if (error.reason) {
        alert(`Transaction failed: ${error.reason}`);
      } else if (
        error.message &&
        error.message.includes("execution reverted")
      ) {
        alert(
          "Transaction reverted by the contract. You may not have permission or the land may not be available."
        );
      } else {
        alert("Failed to request land. Check the console for details.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // if (!registered) {
  //   return (
  //     <div className="p-4">
  //       <div className="bg-white rounded-lg shadow-lg p-6">
  //         <h1 className="text-2xl font-bold text-red-600">
  //           You are not verified to view this page
  //         </h1>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Buyer Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your land properties and requests</p>
      </div>
      
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Sellers Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-6 flex items-center">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-blue-100 font-medium">Total Sellers</p>
              <p className="text-3xl font-bold text-white">{sellersCount}</p>
            </div>
          </div>
        </div>

        {/* Registered Lands Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-6 flex items-center">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-orange-100 font-medium">Registered Lands</p>
              <p className="text-3xl font-bold text-white">{count}</p>
            </div>
          </div>
        </div>

        {/* Total Requests Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-6 flex items-center">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-purple-100 font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-white">{requestsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h5 className="text-lg font-bold text-gray-800 ml-2">Profile</h5>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 mb-4">View and manage your profile details</p>
            <Link
              to="/buyerdashboard/buyerprofile"
              className="flex items-center justify-between w-full text-blue-600 font-medium py-2 px-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span>View Profile</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Owned Lands Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h5 className="text-lg font-bold text-gray-800 ml-2">Owned Lands</h5>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 mb-4">Access your land portfolio</p>
            <Link
              to="/buyerdashboard/ownedlands"
              className="flex items-center justify-between w-full text-green-600 font-medium py-2 px-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span>View Your Lands</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Make Payment Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h5 className="text-lg font-bold text-gray-800 ml-2">Make Payments</h5>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 mb-4">Complete payments for approved land requests</p>
            <Link
              to="/buyerdashboard/makepayment"
              className="flex items-center justify-between w-full text-purple-600 font-medium py-2 px-4 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <span>Make Payment</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Lands Info Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h4 className="text-lg font-bold text-gray-800 ml-2">Available Lands</h4>
          </div>
          {!verified && (
            <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              Verification required for requests
            </span>
          )}
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  City
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Price (in ₹)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Property PID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Survey Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {landData.map((land, index) => (
                <tr key={land.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {land.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {land.area}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {land.city}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {land.state}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    ₹{ethers.utils.formatEther(land.price)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                    {land.pid}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                    {land.surveyNumber}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {land.isRequested ? (
                      <div className="flex items-center text-green-600">
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Requested</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => requestLand(land.owner, land.id)}
                        disabled={!verified}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          !verified
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        }`}
                      >
                        Request Land
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

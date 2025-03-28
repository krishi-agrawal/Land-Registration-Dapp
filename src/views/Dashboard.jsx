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
      const landOwners = {};

      // Get all land owners
      for (let i = 1; i <= count; i++) {
        const address = await contractInstance.getLandOwner(i);
        landOwners[i] = address;
      }

      // Get land details
      for (let i = 1; i <= count; i++) {
        const area = await contractInstance.getArea(i);
        const city = await contractInstance.getCity(i);
        const state = await contractInstance.getState(i);
        const price = await contractInstance.getPrice(i);
        const pid = await contractInstance.getPID(i);
        const surveyNumber = await contractInstance.getSurveyNumber(i);
        const isRequested = await contractInstance.isRequested(i);

        lands.push({
          id: i,
          area: area.toString(),
          city,
          state,
          price: ethers.utils.formatEther(price),
          pid: pid.toString(),
          surveyNumber: surveyNumber.toString(),
          owner: landOwners[i],
          isRequested,
        });
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
    <div className="p-4">
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Sellers Card */}
        <div className="bg-sky-500 text-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <i className="fa fa-users text-3xl mb-2"></i>
            <p className="text-lg font-medium">Total Sellers</p>
            <p className="text-2xl font-bold">{sellersCount}</p>
          </div>
        </div>

        {/* Registered Lands Card */}
        <div className="bg-orange-500 text-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <i className="fa fa-landmark text-3xl mb-2"></i>
            <p className="text-lg font-medium">Registered Lands Count</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        </div>

        {/* Total Requests Card */}
        <div className="bg-blue-500 text-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <i className="fa fa-bell text-3xl mb-2"></i>
            <p className="text-lg font-medium">Total Requests</p>
            <p className="text-2xl font-bold">{requestsCount}</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h5 className="text-lg font-bold">Profile</h5>
          </div>
          <div className="p-4">
            <Link
              to="/buyerdashboard/buyerprofile"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Owned Lands Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h5 className="text-lg font-bold">Owned Lands</h5>
          </div>
          <div className="p-4">
            <Link
              to="/buyerdashboard/ownedlands"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              View Your Lands
            </Link>
          </div>
        </div>

        {/* Make Payment Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h5 className="text-lg font-bold">
              Make Payments for Approved Land Requests
            </h5>
          </div>
          <div className="p-4">
            <Link
              to="/buyerdashboard/makepayment"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Make Payment
            </Link>
          </div>
        </div>
      </div>

      {/* Lands Info Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h4 className="text-lg font-bold">Lands Info</h4>
        </div>
        <div className="p-4 overflow-x-auto">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Land
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {landData.map((land) => (
                <tr key={land.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{land.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.area}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{land.pid}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {land.surveyNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => requestLand(land.owner, land.id)}
                      disabled={!verified || land.isRequested}
                      className={`py-2 px-4 rounded font-medium ${
                        !verified || land.isRequested
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Request Land
                    </button>
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

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Land from "../../artifacts/contracts/Registry.sol/Registry.json";

const OwnedLands = () => {
  const [landContract, setLandContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const contractAddress = "0x273d42dE3e74907cD70739f58DC717dF2872F736";

  useEffect(() => {
    const initialize = async () => {
      try {
        // For refreshing page only once
        if (!localStorage.getItem("pageLoaded")) {
          localStorage.setItem("pageLoaded", "true");
          window.location.reload();
        }

        // Initialize provider and connect wallet
        if (window.ethereum) {
          const ethersProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setProvider(ethersProvider);
          await connectWallet(ethersProvider);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        alert("Failed to initialize. Check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const connectWallet = async (provider) => {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const ethersSigner = provider.getSigner();
      setSigner(ethersSigner);
      setAccount(accounts[0]);

      const contractInstance = new ethers.Contract(
        contractAddress,
        Land.abi,
        ethersSigner
      );
      setLandContract(contractInstance);

      // Check verification and registration status
      const [verified, registered] = await Promise.all([
        contractInstance.isVerified(accounts[0]),
        contractInstance.isBuyer(accounts[0]),
      ]);
      setIsVerified(verified);
      setIsRegistered(registered);

      // Load lands data
      await fetchLandData(contractInstance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const fetchLandData = async (contract, currentAddress) => {
    try {
      setIsLoading(true);
      const count = await contract.getLandsCount();
      const landsCount = parseInt(count.toString());

      const landsList = [];
      let idx = 0;
      for (let i = 1; i <= landsCount; i++) {
        const owner = await contract.getLandOwner(i);
        if (owner.toLowerCase() === currentAddress.toLowerCase()) {
          idx++;
          const [area, city, state, price, pid, surveyNumber] =
            await Promise.all([
              contract.getArea(i),
              contract.getCity(i),
              contract.getState(i),
              contract.getPrice(i),
              contract.getPID(i),
              contract.getSurveyNumber(i),
            ]);

          landsList.push({
            id: idx,
            owner,
            area: area.toString(),
            city,
            state,
            price: ethers.utils.formatEther(price),
            pid: pid.toNumber(),
            surveyNumber: surveyNumber.toString(),
          });
        }
      }
      setLands(landsList);
    } catch (error) {
      console.error("Error fetching land data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // UI Rendering
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-blue-600">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!landContract) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Connecting to contract...
          </h1>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600">
            You are not registered as a buyer
          </h1>
          <p className="mt-2 text-gray-600">
            Please register as a buyer to view your lands.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Your Lands</h2>
          <p className="text-blue-100">Listings you've purchased</p>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
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
                    Price (in ₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey #
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lands.map((land) => (
                  <tr
                    key={land.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.pid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.surveyNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnedLands;

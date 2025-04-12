import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Land from "../../artifacts/contracts/Registry.sol/Registry.json";

const TransactionInfo = () => {
  const [landContract, setLandContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferStatus, setTransferStatus] = useState({}); // Track transfer status per land

  const navigate = useNavigate();

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
        "0x273d42dE3e74907cD70739f58DC717dF2872F736", // Contract address
        Land.abi,
        ethersSigner
      );
      console.log(contractInstance);
      setLandContract(contractInstance);

      // Check if current user is verified as land inspector
      const verificationStatus = await contractInstance.isLandInspector(
        accounts[0]
      );
      setIsVerified(verificationStatus);

      // Get lands data
      await fetchLandData(contractInstance);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const fetchLandData = async (contract) => {
    try {
      const count = await contract.getLandsCount();
      const landsCount = parseInt(count.toString());

      const landsList = [];
      const filteredLands = [];
      for (let i = 1; i <= landsCount; i++) {
        const isRequested = await contract.isRequested(i);
        if (isRequested) {
          const [
            owner,
            area,
            city,
            state,
            price,
            pid,
            surveyNumber,
            request,
            isPaid,
          ] = await Promise.all([
            contract.getLandOwner(i),
            contract.getArea(i),
            contract.getCity(i),
            contract.getState(i),
            contract.getPrice(i),
            contract.getPID(i),
            contract.getSurveyNumber(i),
            contract.getRequestDetails(i),
            contract.isPaid(i),
          ]);

          const transferCompleted = request[1] === owner;

          landsList.push({
            originalId: i, // Keep original ID for reference
            owner,
            area: area.toString(),
            city,
            state,
            price: ethers.utils.formatEther(price),
            pid: pid.toNumber(),
            surveyNumber: surveyNumber.toString(),
            request,
            isPaid,
            transferCompleted,
          });
        }
      }

      // Update IDs to be sequential starting from 1
      const landsWithSequentialIds = landsList.map((land, index) => ({
        ...land,
        id: index + 1, // New sequential ID
      }));

      console.log(landsWithSequentialIds);
      setLands(landsWithSequentialIds);
    } catch (error) {
      console.error("Error fetching land data:", error);
      throw error;
    }
  };
  const landTransfer = async (landId, newOwner) => {
    try {
      // Disable the button immediately
      setTransferStatus((prev) => ({ ...prev, [landId]: false }));

      const tx = await landContract.LandOwnershipTransfer(landId, newOwner, {
        from: account,
        gasLimit: 2100000,
      });

      await tx.wait();

      // Update the state to reflect the completed transfer
      setLands((prevLands) =>
        prevLands.map((land) =>
          land.id === landId
            ? { ...land, transferCompleted: false, isApproved: true }
            : land
        )
      );

      // Optionally refresh data from blockchain
      await fetchLandData(landContract);
    } catch (error) {
      console.error("Transfer error:", error);
      // Re-enable the button if transfer failed
      setTransferStatus((prev) => ({ ...prev, [landId]: true }));
      alert("Land transfer verification failed. See console for details.");
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

  if (!isVerified) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600">
            You are not authorized to view this page
          </h1>
          <p className="mt-2 text-gray-600">
            Only verified land inspectors can access this functionality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Lands Information</h2>
          <p className="text-blue-100">Transfer ownership verification panel</p>
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
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
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
                    Price (ETH)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lands.map((land) => {
                  // Determine if button should be disabled
                  const hasPendingRequest = land.request[3]; // Assuming request[3] indicates pending status
                  const isDisabled = !land.isPaid || land.transferCompleted;

                  return (
                    <tr
                      key={land.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {land.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {`${land.owner.substring(
                          0,
                          6
                        )}...${land.owner.substring(38)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {`${land.request[1].substring(
                          0,
                          6
                        )}...${land.request[1].substring(38)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {`${land.request[0].substring(
                          0,
                          6
                        )}...${land.request[0].substring(38)}`}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              landTransfer(land.id, land.request[1])
                            }
                            disabled={isDisabled}
                            className={`px-4 py-2 rounded-md text-white shadow-sm transition-all ${
                              isDisabled
                                ? "bg-gray-400 cursor-not-allowed opacity-60"
                                : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                            }`}
                          >
                            {land.transferCompleted
                              ? "Verified"
                              : "Verify Transfer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfo;

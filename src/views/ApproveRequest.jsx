import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// import Land from "../artifacts/Land.json";
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json";

const ApproveRequest = () => {
  // States
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Load request data after contract is initialized
      await loadRequestData(contractInstance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  // For refreshing page only once
  useEffect(() => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
  }, []);

  const loadRequestData = async (contractInstance, currentAddress) => {
    try {
      // Check if user is a registered seller
      const isSeller = await contractInstance.isSeller(currentAddress);
      console.log("Is registered seller:", isSeller);
      setRegistered(isSeller);

      // Get requests count
      const requestsCount = await contractInstance.getRequestsCount();
      console.log("Requests count:", requestsCount.toString());

      // Fetch all relevant requests
      const userRequests = [];

      for (let i = 1; i <= requestsCount; i++) {
        const request = await contractInstance.getRequestDetails(i);
        const approved = await contractInstance.isApproved(i);

        // Check if current user is the land owner
        if (currentAddress.toLowerCase() === request[0].toLowerCase()) {
          userRequests.push({
            id: i,
            buyerId: request[1],
            landId: request[2],
            status: request[3].toString(),
            approved,
          });
        }
      }

      setRequests(userRequests);
      setLoading(false);
    } catch (error) {
      console.error("Error loading request data:", error);
      setLoading(false);
    }
  };

  const approveRequest = async (reqId) => {
    try {
      if (!contract) return;

      const tx = await contract.approveRequest(reqId);
      await tx.wait();

      // Reload the page after transaction is confirmed
      window.location.reload();
    } catch (error) {
      console.error("Error approving request:", error);
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

  // Not registered seller
  if (!registered) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600">
            You are not authorized to view this page.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-xl font-bold text-gray-800">Requests Info</h4>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Land ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approve Request
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.buyerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.landId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => approveRequest(request.id)}
                          disabled={request.approved}
                          className={`py-2 px-4 rounded font-medium ${
                            request.approved
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-700 text-white transition duration-300"
                          }`}
                        >
                          Approve Request
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveRequest;

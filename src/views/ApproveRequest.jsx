import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json";
import { Spinner } from "react-bootstrap";

const ApproveRequest = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [registered, setRegistered] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        Registry.abi,
        ethersSigner
      );
      setContract(contractInstance);

      await loadRequests(contractInstance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const loadRequests = async (contractInstance, address) => {
    try {
      const isRegistered = await contractInstance.isSeller(address);
      setRegistered(isRegistered);
    //   if (!isRegistered) {
    //     setLoading(false);
    //     return;
    //   }

      const requestsCount = await contractInstance.getRequestsCount();
      const requestsData = [];

      for (let i = 0; i < requestsCount; i++) {
        const request = await contractInstance.getRequestDetails(i);
        const isApproved = await contractInstance.isApproved(i);

        if (address.toLowerCase() === request[0].toLowerCase()) {
          requestsData.push({
            id: i + 1,
            buyerId: request[1],
            landId: request[2],
            status: request[3].toString(),
            approved: isApproved,
          });
        }
      }

      setRequests(requestsData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      const tx = await contract.approveRequest(requestId, {
        gasLimit: 2100000,
      });
      await tx.wait();
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, approved: true } : req
        )
      );
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!registered) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">
          You are not authorized to view this page.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white">Requests Info</h2>
          </div>
          <p>hi</p>
          <div className="p-6">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-6 text-left">#</th>
                  <th className="py-3 px-6 text-left">Buyer ID</th>
                  <th className="py-3 px-6 text-left">Land ID</th>
                  <th className="py-3 px-6 text-left">Request Status</th>
                  <th className="py-3 px-6 text-left">Approve Request</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b">
                    <td className="py-4 px-6">{request.id}</td>
                    <td className="py-4 px-6">{request.buyerId}</td>
                    <td className="py-4 px-6">{request.landId}</td>
                    <td className="py-4 px-6">{request.status}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => approveRequest(request.id)}
                        disabled={request.approved}
                        className={`px-4 py-2 rounded ${
                          request.approved
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-700"
                        } text-white font-bold`}
                      >
                        {request.approved ? "Approved" : "Approve Request"}
                      </button>
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

export default ApproveRequest;

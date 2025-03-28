
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import Land from "../../artifacts/contracts/Registry.sol/Registry.json";
import { Spinner } from 'react-bootstrap';

const LIDashboard = () => {
  const [landContract, setLandContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sellersCount, setSellersCount] = useState(0); 
  const [buyersCount, setBuyersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  
  const navigate = useNavigate();

  // Connect wallet function
  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        const ethersSigner = provider.getSigner();
        setSigner(ethersSigner);
        setAccount(accounts[0]);
        
        // Use specific contract address
        const contractInstance = new ethers.Contract(
          "0x273d42dE3e74907cD70739f58DC717dF2872F736", // Contract address
          Land.abi,
          ethersSigner
        );
        
        console.log("Contract Inst: ", contractInstance);
        setLandContract(contractInstance);
        
        // Check if current user is a land inspector
        const verificationStatus = await contractInstance.isLandInspector(accounts[0]);
        setIsVerified(verificationStatus);
        
        // Get counts
        const sellerCount = await contractInstance.getSellersCount();
        const buyerCount = await contractInstance.getBuyersCount();
        const reqCount = await contractInstance.getRequestsCount();
        
        setSellersCount(parseInt(sellerCount.toString()));
        setBuyersCount(parseInt(buyerCount.toString()));
        setRequestsCount(parseInt(reqCount.toString()));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Check console for details.");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // For refreshing page only once
    if (!window.location.hash) {
      window.location = window.location + '#loaded';
      window.location.reload();
    }
    
    // Initialize provider and connect wallet
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      connectWallet();
    } else {
      alert("Please install MetaMask!");
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner animation="border" variant="primary" className="h-12 w-12" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600">
            You are not verified to view this page
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Buyers Card */}
          <div className="bg-sky-100 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center">
              <i className="fa fa-users text-4xl text-sky-500 mb-3" aria-hidden="true"></i>
              <h3 className="text-lg font-medium mb-2">Total Buyers</h3>
              <p className="text-3xl font-bold text-sky-700">{buyersCount}</p>
            </div>
          </div>
          
          {/* Requests Card */}
          <div className="bg-blue-100 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center">
              <i className="fa fa-bell text-4xl text-blue-500 mb-3" aria-hidden="true"></i>
              <h3 className="text-lg font-medium mb-2">Total Requests</h3>
              <p className="text-3xl font-bold text-blue-700">{requestsCount}</p>
            </div>
          </div>
          
          {/* Sellers Card */}
          <div className="bg-orange-100 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center">
              <i className="fa fa-users text-4xl text-orange-500 mb-3" aria-hidden="true"></i>
              <h3 className="text-lg font-medium mb-2">Total Sellers</h3>
              <p className="text-3xl font-bold text-orange-700">{sellersCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Buyers Information Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h5 className="text-xl font-medium">Buyers Information</h5>
          </div>
          <div className="p-6 flex justify-center">
            <button 
              onClick={() => navigate('/LI/BuyerInfo')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Verify Buyers
            </button>
          </div>
        </div>
        
        {/* Land Transfer Requests Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h5 className="text-xl font-medium">Land Transfer Requests</h5>
          </div>
          <div className="p-6 flex justify-center">
            <button 
              onClick={() => navigate('/LI/TransactionInfo')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Approve Land Transactions
            </button>
          </div>
        </div>
        
        {/* Sellers Information Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h5 className="text-xl font-medium">Sellers Information</h5>
          </div>
          <div className="p-6 flex justify-center">
            <button 
              onClick={() => navigate('/LI/SellerInfo')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Verify Sellers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LIDashboard; 

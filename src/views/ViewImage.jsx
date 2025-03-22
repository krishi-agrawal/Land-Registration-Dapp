import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json";

// Row arrays for storing contract data
let row = [];
let rowsIpfs = [];

const ViewImage = () => {
  // States
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [flag, setFlag] = useState(null);
  const [verified, setVerified] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [count, setCount] = useState(0);
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [landData, setLandData] = useState([]);
  
  const navigate = useNavigate();

  const viewImage = (landId) => {
    alert(landId);
    navigate('/viewImage');
  };

  // Using your provided MetaMask auth code
  useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      connectWallet();
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        const ethersSigner = provider.getSigner();
        setSigner(ethersSigner);
        setAccount(accounts[0]); 
         
        const contractInstance = new ethers.Contract(
          "0x273d42dE3e74907cD70739f58DC717dF2872F736",
          Registry.abi,
          ethersSigner
        );
        setContract(contractInstance);
        
        // Load land data after contract is initialized
        await loadLandData(contractInstance, accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setLoading(false);
      }
    }
  };

  // For refreshing page only once
  useEffect(() => { 
    if (!window.location.hash) {
      window.location = window.location + '#loaded';
      window.location.reload();
    }
  }, []);

  const loadLandData = async (contractInstance, currentAddress) => {
    try {
      // Check if user is verified
      const isVerified = await contractInstance.isVerified(currentAddress);
      console.log("Is verified:", isVerified);
      setVerified(isVerified);
      
      // Set registered to true (as in original)
      setRegistered(true);
      
      // Get land count
      const landsCount = await contractInstance.getLandsCount();
      const count = parseInt(landsCount.toString());
      console.log("Land count:", count);
      setCount(count);
      
      // Clear arrays
      row = [];
      rowsIpfs = [];
      
      // Collect land data 
      const lands = [];
      
      for (let i = 1; i <= count; i++) {
        const area = await contractInstance.getArea(i);
        const city = await contractInstance.getCity(i);
        const state = await contractInstance.getState(i);
        // const status = await contractInstance.getStatus(i);
        const price = await contractInstance.getPrice(i);
        const pid = await contractInstance.getPID(i);
        const surveyNumber = await contractInstance.getSurveyNumber(i);
        const landImg = await contractInstance.getImage(i);
        const document = await contractInstance.getDocument(i);
        
        // Store the image hash
        rowsIpfs.push(landImg);
        
        // Create card component for the land
        row.push(
          <div key={i} className="w-full md:w-1/2 p-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition duration-300 hover:shadow-xl">
              <div className="relative">
                <div className="absolute top-0 left-0 bg-blue-500 text-white font-bold py-1 px-3 rounded-br-lg z-10">
                  {i}
                </div>
                <img 
                  src={landImg} 
                  alt={`Land ${i}`} 
                  className="w-full h-64 object-cover"
                />
              </div>
              
              <div className="p-5">
                <span className="text-xs text-blue-500 font-semibold">Photos</span>
                <h3 className="text-2xl font-bold mb-1">{area.toString()} Sq. m.</h3>
                <h4 className="text-lg text-gray-600 mb-2">{city}, {state}</h4>
                <p className="text-gray-700 mb-3">
                  PID: {pid.toString()}<br/> 
                  Survey No.: {surveyNumber.toString()}
                </p>
                <div className="border-t pt-3">
                  <p className="text-lg font-semibold">Price: ₹ {ethers.utils.formatEther(price)}</p>
                  <p className="mt-2">
                    View Verified Land {' '}
                    <a 
                      href={`https://ipfs.io/ipfs/${document}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Document
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
        lands.push({
          id: i,
          area: area.toString(),
          city,
          state,
          price: ethers.utils.formatEther(price),
          pid: pid.toString(),
          surveyNumber: surveyNumber.toString(),
          image: landImg,
          document
        });
      }
      
      setLandData(lands);
      setLoading(false);
    } catch (error) {
      console.error("Error loading land data:", error);
      setLoading(false);
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

  // Not registered or verified
  if (!registered || !verified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600">
            You are not verified to view this page
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap -mx-4">
        {row}
      </div>
    </div>
  );
};

export default ViewImage;  
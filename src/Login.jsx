import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import Registry from "../artifacts/contracts/Registry.sol/Registry.json";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.globe.min";
import "./VantaGlobe.css"; // Import CSS for styling
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [role, setRole] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [landInspector, setLandInspector] = useState(false);
  const [seller, setSeller] = useState(false);
  const [buyer, setBuyer] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  const vantaRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Vanta.js effect
  useEffect(() => {
    if (!vantaRef.current) return;
    
    // Initialize Vanta.js effect after the component mounts
    const vantaEffect = GLOBE({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x65c7f7,
      THREE: THREE,
    });

    return () => {
      // Cleanup the Vanta.js effect to prevent memory leaks
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  // Setup provider on component mount
  useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
    }
  }, []);

  // Check user roles when signer or contract changes
  useEffect(() => {
    const checkUserRoles = async () => {
      if (!signer || !contract) return;
      
      try {
        const userAddress = await signer.getAddress();
        console.log("Checking roles for address:", userAddress);
        
        const [isSeller, isBuyer, isLandInspector] = await Promise.all([
          contract.isSeller(userAddress),
          contract.isBuyer(userAddress),
          contract.isLandInspector(userAddress)
        ]);
        
        setSeller(isSeller);
        setBuyer(isBuyer);
        setLandInspector(isLandInspector);
        
        console.log("Roles:", { isSeller, isBuyer, isLandInspector });
      } catch (error) {
        console.error("Error checking user roles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserRoles();
  }, [signer, contract]);

  const connectWallet = async () => {
    if (!provider) {
      alert("Please install MetaMask to continue.");
      return;
    }
    
    setLoading(true);
    
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }
      
      setAccount(accounts[0]);
      
      const ethersSigner = provider.getSigner();
      setSigner(ethersSigner);
      
      const contractInstance = new ethers.Contract(
        "0x273d42dE3e74907cD70739f58DC717dF2872F736",
        Registry.abi,
        ethersSigner
      );
      setContract(contractInstance);
      console.log("Contract Instance:", contractInstance);
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const selectedRole = event.target.value;
    setRole(selectedRole);
    setRedirect(`/Register${selectedRole}`);
  };

  const submit = () => {
    if (redirect) {
      navigate(redirect);
    }
  };

  return (
    <div ref={vantaRef} className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center mb-8 animate-fade-in">
        <img
          src="https://i.ibb.co/dJ3fxn69/logo.jpg"
          alt="Land Registry Logo"
          className="h-32 w-32 mx-auto mb-4 rounded-lg border-4 border-white shadow-lg"
        />
        <h1 className="text-5xl font-bold text-white mb-2">Land Registry</h1>
        <p className="text-gray-200 text-lg">Secure & Transparent Property Management</p>
      </div>

      {!account ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to access the platform.</p>
          
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition-all"
          >
            {loading ? "Connecting..." : "Connect with MetaMask"}
          </button>
        </div>
      ) : seller || buyer || landInspector ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back!</h2>
          <p className="text-gray-600 mb-4">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <div className="flex flex-col gap-4">
            <a
              href="/SellerDashboard"
              className={`py-3 px-6 text-white rounded-lg text-center transition-all ${seller ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
              Seller Dashboard
            </a>
            <a
              href="/BuyerDashboard"
              className={`py-3 px-6 text-white rounded-lg text-center transition-all ${buyer ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
              Buyer Dashboard
            </a>
            <a
              href="/LIdashboard"
              className={`py-3 px-6 text-white rounded-lg text-center transition-all ${landInspector ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
              Land Inspector Dashboard
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Get Started</h2>
          <p className="text-gray-600 mb-2">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p className="text-gray-600 mb-6">Select your role to register.</p>

          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 font-medium mb-2">Select Role</label>
            <select
              id="role"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={handleInputChange}
              defaultValue=""
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>

          <button
            onClick={submit}
            disabled={!role}
            className={`w-full py-3 px-6 text-white rounded-lg focus:outline-none transition-all ${role ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Register
          </button>
        </div>
      )}

      <div className="mt-8">
        <a href="/Help" className="text-white underline hover:text-gray-200 transition-all">
          Need Help?
        </a>
      </div>
    </div>
  );
};

export default Login;
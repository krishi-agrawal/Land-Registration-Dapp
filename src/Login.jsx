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
    <div ref={vantaRef} className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 relative overflow-hidden">
  {/* Background particles or decorative elements */}
  <div className="absolute inset-0 z-0">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500 opacity-10 filter blur-3xl"></div>
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500 opacity-10 filter blur-3xl"></div>
  </div>
  
  <div className="z-10 w-full max-w-screen-xl px-6 flex flex-col items-center">
    {/* Logo and Header */}
    <div className="text-center mb-10 animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
        <img
          src="https://i.ibb.co/dJ3fxn69/logo.jpg"
          alt="Land Registry Logo"
          className="relative h-36 w-36 mx-auto rounded-2xl border-4 border-white/30 shadow-2xl object-cover"
        />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">Land Registry</h1>
      <p className="text-blue-100 text-xl max-w-xl">Secure & Transparent Property Management on Blockchain</p>
    </div>
    
    {/* Card Section */}
    {!account ? (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all hover:scale-102 hover:shadow-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-blue-100 mb-6">Connect your MetaMask wallet to access the decentralized land registry platform.</p>
        
        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-medium"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Connect with MetaMask
            </>
          )}
        </button>
      </div>
    ) : seller || buyer || landInspector ? (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all hover:scale-102 hover:shadow-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome Back!</h2>
        <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 mb-6">
          <div className="bg-blue-500/30 p-2 rounded-md mr-3">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-200">Connected Wallet</p>
            <p className="text-white font-medium">{account.slice(0, 6)}...{account.slice(-4)}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/SellerDashboard')}
            disabled={!seller}
            className={`py-3 px-6 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
              seller 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl" 
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Seller Dashboard
          </button>
          <button
            onClick={() => navigate('/BuyerDashboard')}
            disabled={!buyer}
            className={`py-3 px-6 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
              buyer 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl" 
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Buyer Dashboard
          </button>
          <button
            onClick={() => navigate('/LIdashboard')}
            disabled={!landInspector}
            className={`py-3 px-6 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
              landInspector 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl" 
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Land Inspector Dashboard
          </button>
        </div>
      </div>
    ) : (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all hover:scale-102 hover:shadow-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
        <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 mb-6">
          <div className="bg-blue-500/30 p-2 rounded-md mr-3">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-200">Connected Wallet</p>
            <p className="text-white font-medium">{account.slice(0, 6)}...{account.slice(-4)}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="role" className="block text-blue-100 font-medium mb-2">Select Role</label>
          <div className="relative">
            <select
              id="role"
              className="w-full p-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              onChange={handleInputChange}
              defaultValue=""
            >
              <option value="" disabled>Select Role</option>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <button
          onClick={submit}
          disabled={!role}
          className={`w-full py-4 px-6 rounded-xl focus:outline-none transition-all flex items-center justify-center gap-2 font-medium ${
            role 
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl" 
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Register as {role || 'User'}
        </button>
      </div>
    )}
    
    {/* Footer Help Link */}
    <div className="mt-10 text-center">
      <button 
        onClick={() => navigate('/Help')}
        className="inline-flex items-center text-blue-200 hover:text-white transition-all gap-2 px-4 py-2 rounded-lg hover:bg-white/5"
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Need Help?
      </button>
    </div>
  </div>
</div>
  );
};

export default Login;
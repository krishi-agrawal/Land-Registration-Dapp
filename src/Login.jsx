import { useEffect, useRef, useState } from "react";
// import { ethers } from "ethers";
// import LandContract from "./artifacts/Land.json";
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
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const vantaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
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
      vantaEffect.destroy();
    };
  }, []);

  // Original blockchain logic (commented out for now)
  // useEffect(() => {
  //   const loadBlockchainData = async () => {
  //     try {
  //       if (!window.ethereum) {
  //         alert("Please install MetaMask to continue.");
  //         return;
  //       }
  //
  //       const provider = new ethers.providers.Web3Provider(window.ethereum);
  //       await provider.send("eth_requestAccounts", []);
  //       const signer = provider.getSigner();
  //       const accounts = await provider.listAccounts();
  //       const network = await provider.getNetwork();
  //
  //       const deployedNetwork = LandContract.networks[network.chainId];
  //       const contract = new ethers.Contract(
  //         deployedNetwork.address,
  //         LandContract.abi,
  //         signer
  //       );
  //
  //       const userAddress = await signer.getAddress();
  //       const seller = await contract.isSeller(userAddress);
  //       const buyer = await contract.isBuyer(userAddress);
  //       const landInspector = await contract.isLandInspector(userAddress);
  //
  //       setContract(contract);
  //       setAccount(accounts[0]);
  //       setSeller(seller);
  //       setBuyer(buyer);
  //       setLandInspector(landInspector);
  //     } catch (error) {
  //       console.error("Error connecting to contract:", error);
  //       alert("Failed to load blockchain data.");
  //     }
  //   };
  //
  //   loadBlockchainData();
  // }, []);

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

      {seller || buyer || landInspector ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back!</h2>
          <div className="flex flex-col gap-4">
            <a
              href="/Seller/SellerDashboard"
              className={`py-3 px-6 text-white rounded-lg text-center transition-all ${seller ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
              Seller Dashboard
            </a>
            <a
              href="/Buyer/BuyerDashboard"
              className={`py-3 px-6 text-white rounded-lg text-center transition-all ${buyer ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
              Buyer Dashboard
            </a>
            <a
              href="/LI/LIdashboard"
              className={`py-3 px-6 text-white rounded-lg text-center transition-all ${landInspector ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
              Land Inspector Dashboard
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Get Started</h2>
          <p className="text-gray-600 mb-6">Select your role to begin your journey.</p>

          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 font-medium mb-2">Select Role</label>
            <select
              id="role"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={handleInputChange}
            >
              <option value="" disabled selected>
                Select Role
              </option>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>

          <button
            onClick={submit}
            className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition-all"
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

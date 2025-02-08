import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json"

const RegisterBuyer = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const [signer, setSigner] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState(""); 
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      connectWallet()
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
          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          Registry.abi,
          ethersSigner
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };

  const registerBuyer = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name || !age || !city || !email || !aadharNumber || !panNumber || !document) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 2000);
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Buyer Registration</h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 mb-4"
          >
            Connect to MetaMask
          </button>
        ) : (
          <p className="text-green-600 text-center mb-4">
            Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        )}


        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6 text-center">
            {success}
          </div>
        )}

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Age"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <input
            type="text"
            placeholder="City"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Aadhar Number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="PAN Number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value)}
          />
          <input
            type="file"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={(e) => setDocument(e.target.files[0])}
          />
        </div>

        <button
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={registerBuyer}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
};

export default RegisterBuyer;

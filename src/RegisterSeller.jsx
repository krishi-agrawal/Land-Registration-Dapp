import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Registry from "../artifacts/contracts/Registry.sol/Registry.json";
import axios from "axios";
import { toast } from "react-toastify";

const RegisterSeller = () => {
  const navigate = useNavigate();
  const [landInstance, setLandInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [landsOwned, setLandsOwned] = useState("");
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pinata Configuration
  const apiKey = "3df76883d3f7b0b7bf14"; // Replace with your Pinata API key
  const apiSecret = "318a60d3bf31978bd8bd9bb490e2153201e5600efdbf49ac167aa15cc2ca7dfb"; // Replace with your Pinata API secret
  const pinataBaseUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";

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
          "0x273d42dE3e74907cD70739f58DC717dF2872F736", // Replace with your contract address
          Registry.abi,
          ethersSigner
        );
        console.log("Contract Inst: ", contractInstance)
        // console.log("Is seller: ", await contractInstance.isSeller("0x2C7340e031050D957b6FFb0e7ED77e2b30fd3DAa"))

        setContract(contractInstance);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };

  const captureDoc = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setDocument(file);
  };

  const uploadToPinata = async (file, fileName) => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: fileName,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    try {
      const response = await axios.post(pinataBaseUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
      });
      return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      toast.error("File upload failed");
      throw error;
    }
  };

  const registerSeller = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name || !age || !aadharNumber || !panNumber || !landsOwned || !document) {
      setError("All fields are compulsory!");
      setLoading(false);
      return;
    }

    // if (!Number(aadharNumber) || aadharNumber.length !== 12) {
    //   setError("Aadhar Number should be 12 digits long!");
    //   setLoading(false);
    //   return;
    // }

    // if (panNumber.length !== 10) {
    //   setError("Pan Number should be a 10-digit unique number!");
    //   setLoading(false);
    //   return;
    // }

    if (!Number(age) || age < 21) {
      setError("Your age must be a number and at least 21 years old.");
      setLoading(false);
      return;
    }

    try {
      // Upload document to Pinata
      const documentHash = await uploadToPinata(document, "seller-document.pdf");
      console.log("Document uploaded to IPFS:", documentHash);
      console.log("Name: ", name);
      console.log("age: ", parseInt(age))
      console.log("aadharNumber: ", aadharNumber);
      console.log("panNumber: ", panNumber);
      console.log("landsOwnedd: ",  parseInt(landsOwned));
      console.log("documentHash: ",  documentHash);
      

      // Call contract method to register seller
      const tx = await contract.registerSeller(
        name,
        parseInt(age),
        aadharNumber,
        panNumber,
        parseInt(landsOwned),
        documentHash,  { gasLimit: 500000 } 
      );

      await tx.wait();
      console.log("tx: ", tx)
      setSuccess("Registration successful! Redirecting...");
      toast.success("Seller registered successfully!");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error(error);
      toast.error("Registration failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Seller Registration</h1>

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

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-center">
            {error}
          </div>
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
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Age"
            className="input"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <input
            type="text"
            placeholder="Aadhar Number"
            className="input"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="PAN Number"
            className="input"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Lands Owned"
            className="input"
            value={landsOwned}
            onChange={(e) => setLandsOwned(e.target.value)}
          />
          <input
            type="file"
            className="input"
            onChange={captureDoc}
            accept="application/pdf"
          />
        </div>

        <button
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={registerSeller}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register as Seller"}
        </button>
      </div>
    </div>
  );
};

export default RegisterSeller;
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Registry from "../artifacts/contracts/Registry.sol/Registry.json";
import axios from "axios";
import { toast } from "react-toastify";

const RegisterBuyer = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [document, setDocument] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiKey = "3df76883d3f7b0b7bf14";
  const apiSecret =
    "318a60d3bf31978bd8bd9bb490e2153201e5600efdbf49ac167aa15cc2ca7dfb";
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
          "0x273d42dE3e74907cD70739f58DC717dF2872F736",
          Registry.abi,
          ethersSigner
        );
        console.log("Contract Inst: ", contractInstance);
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

  const registerBuyer = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (
      !name ||
      !age ||
      !city ||
      !aadharNumber ||
      !panNumber ||
      !document ||
      !email
    ) {
      setError("All fields are compulsory!");
      setLoading(false);
      return;
    }

    if (!Number(age) || age < 21) {
      setError("Your age must be a number and at least 21 years old.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      console.log("Checking if address is already registered...");
      try {
        const isRegistered = await contract.RegisteredAddressMapping(account);
        console.log("Is already registered:", isRegistered);
        if (isRegistered) {
          setError("This wallet address is already registered in the system!");
          setLoading(false);
          setTimeout(() => {
            navigate("/buyerdashboard");
          }, 2000);
          return;
        }
      } catch (checkError) {
        console.error("Error checking registration status:", checkError);
      }

      // Upload document to Pinata
      const documentHash = await uploadToPinata(document, "buyer-document.pdf");
      console.log("Document uploaded to IPFS:", documentHash);

      console.log("Registration parameters:");
      console.log("Name:", name);
      console.log("Age:", parseInt(age));
      console.log("City:", city);
      console.log("Aadhar Number:", aadharNumber);
      console.log("PAN Number:", panNumber);
      console.log("Document Hash:", documentHash);
      console.log("Email:", email);

      console.log("Sending transaction to register buyer...");
      const tx = await contract.registerBuyer(
        name,
        parseInt(age),
        city,
        aadharNumber,
        panNumber,
        documentHash,
        email,
        {
          gasLimit: 1000000,
        }
      );

      console.log("Transaction sent, waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      setSuccess("Registration successful! Redirecting...");
      toast.success("Buyer registered successfully!");

      setTimeout(() => {
        navigate("/BuyerProfile");
      }, 2000);
    } catch (error) {
      console.error("Detailed error:", error);

      let errorMessage = "Registration failed: ";

      if (error.reason) {
        errorMessage += error.reason;
      } else if (error.data && error.data.message) {
        errorMessage += error.data.message;
      } else if (error.message) {
        const message = error.message.split("(")[0].trim();
        errorMessage += message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Buyer Registration
        </h1>

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
            placeholder="City"
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          onClick={registerBuyer}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register as Buyer"}
        </button>
      </div>
    </div>
  );
};

export default RegisterBuyer;

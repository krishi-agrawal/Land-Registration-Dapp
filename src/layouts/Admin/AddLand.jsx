import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Registry from "../../../artifacts/contracts/Registry.sol/Registry.json";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormGroup,
  Input,
  Row,
  Col,
} from "reactstrap";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const AddLand = () => {
  const [landInstance, setLandInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [verified, setVerified] = useState(true);
  const [registered, setRegistered] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [stateLoc, setStateLoc] = useState("");
  const [price, setPrice] = useState("");
  const [propertyPID, setPropertyPID] = useState("");
  const [surveyNum, setSurveyNum] = useState("");
  const [landImage, setLandImage] = useState(null);
  const [aadharDocument, setAadharDocument] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const navigate = useNavigate();

  // Pinata Configuration
  const apiKey = "3df76883d3f7b0b7bf14";
  const apiSecret =
    "318a60d3bf31978bd8bd9bb490e2153201e5600efdbf49ac167aa15cc2ca7dfb";
  const pinataBaseUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";

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

  const connectWallet = async (ethersProvider) => {
    if (!ethersProvider) return;

    try {
      const accounts = await ethersProvider.send("eth_requestAccounts", []);
      const ethersSigner = ethersProvider.getSigner();
      setSigner(ethersSigner);
      setAccount(accounts[0]);
      console.log("Account set:", accounts[0]);

      const contractInstance = new ethers.Contract(
        "0x273d42dE3e74907cD70739f58DC717dF2872F736",
        Registry.abi,
        ethersSigner
      );
      setLandInstance(contractInstance);
      console.log("Contract instance set:", contractInstance);

      // Check verification status
      // const isVerified = await contractInstance.SellerVerification(accounts[0]);
      // const isRegistered = await contractInstance.RegisteredSellerMapping(accounts[0]);

      // setVerified(isVerified);
      // setRegistered(isRegistered);
      setLoading(false);
      // console.log("Verification status:", isRegistered);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const ethersProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setProvider(ethersProvider);
          console.log("Provider set:", ethersProvider);

          // Check if we're already connected
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            await connectWallet(ethersProvider);
          } else {
            setLoading(false);
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              connectWallet(ethersProvider);
            } else {
              setAccount(null);
              setLandInstance(null);
            }
          });
        } catch (error) {
          console.error("Error initializing provider:", error);
          setLoading(false);
        }
      } else {
        toast.error("Please install MetaMask!");
        console.error("MetaMask not detected");
        setLoading(false);
      }
    };

    init();

    return () => {
      // Clean up event listener
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  const uploadFiles = async () => {
    if (!landImage || !aadharDocument) {
      toast.warn("Please select both land image and Aadhar document");
      return;
    }

    setUploadLoading(true);

    try {
      const imageHash = await uploadToPinata(landImage, "land_image.jpg");
      const documentHash = await uploadToPinata(
        aadharDocument,
        "aadhar_document1.pdf"
      );

      setImageUrl(imageHash);
      setDocumentUrl(documentHash);

      toast.success("Files uploaded successfully");
      setUploadLoading(false);
      return { imageHash, documentHash };
    } catch (error) {
      setUploadLoading(false);
      return null;
    }
  };

  const addLand = async () => {
    // Validate inputs
    if (!area || !city || !stateLoc || !price || !propertyPID || !surveyNum) {
      toast.warn("All fields are required!");
      return;
    }

    if (isNaN(area) || isNaN(price)) {
      toast.warn("Land area and price must be numbers!");
      return;
    }

    if (!imageUrl || !documentUrl) {
      toast.warn("Please upload land image and Aadhar document first!");
      return;
    }

    setTransactionLoading(true);

    try {
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(price);

      // Call contract method
      const tx = await landInstance.addLand(
        parseInt(area),
        city,
        stateLoc,
        priceInWei,
        parseInt(propertyPID),
        parseInt(surveyNum),
        imageUrl,
        documentUrl
      );

      await tx.wait();
      toast.success("Land added successfully!");
      navigate("/sellerdashboard");
    } catch (error) {
      console.error("Error adding land:", error);
      toast.error("Transaction failed: " + error.message);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleLandImageUpload = (event) => {
    const file = event.target.files[0];
    setLandImage(file);
  };

  const handleAadharDocumentUpload = (event) => {
    const file = event.target.files[0];
    setAadharDocument(file);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
  <div className="max-w-3xl mx-auto">
    {/* Header */}
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">Add New Land</h1>
      <p className="text-gray-600 mt-1">Register a new property on the blockchain</p>
    </div>

    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-lg mr-4">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Land Registration Form</h2>
            <p className="text-blue-100 mt-1">Enter property details to add to the blockchain</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!account ? (
          <button
            onClick={() => connectWallet(provider)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow transition-all flex items-center justify-center"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect to MetaMask
          </button>
        ) : (
          <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
            <div className="bg-blue-500/20 p-2 rounded-md mr-3">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800">Connected Wallet</p>
              <p className="text-blue-600 font-medium">{account.slice(0, 6)}...{account.slice(-4)}</p>
            </div>
          </div>
        )}

        {!registered || !verified ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-lg" role="alert">
            <div className="flex items-center mb-1">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <strong className="font-bold text-red-800">Access Denied </strong>
            </div>
            <p className="text-red-600">Your account needs to be registered and verified before you can add land properties.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Area (sqm)
                </label>
                <Input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 1200"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  City
                </label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  State
                </label>
                <Input
                  type="text"
                  value={stateLoc}
                  onChange={(e) => setStateLoc(e.target.value)}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Maharashtra"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Price (ETH)
                </label>
                <Input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 2.5"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Property PID
                </label>
                <Input
                  type="text"
                  value={propertyPID}
                  onChange={(e) => setPropertyPID(e.target.value)}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. PID123456"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Survey Number
                </label>
                <Input
                  type="text"
                  value={surveyNum}
                  onChange={(e) => setSurveyNum(e.target.value)}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. SN-78923"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Upload Land Image
              </label>
              <div className="flex space-x-2">
                <Input
                  type="file"
                  onChange={handleLandImageUpload}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={uploadFiles}
                  disabled={!landImage || uploadLoading}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    !landImage || uploadLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  {uploadLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </div>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Upload Aadhar Card
              </label>
              <div className="flex space-x-2">
                <Input
                  type="file"
                  onChange={handleAadharDocumentUpload}
                  className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={uploadFiles}
                  disabled={!aadharDocument || uploadLoading}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    !aadharDocument || uploadLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  {uploadLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </div>
                  ) : (
                    "Upload Document"
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <button
                onClick={addLand}
                disabled={transactionLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg w-full flex justify-center items-center shadow-sm hover:shadow transition-all"
              >
                {transactionLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Transaction...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Register Land Property
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = "/sellerDashboard"}
            className="inline-flex items-center px-6 py-2.5 rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default AddLand;
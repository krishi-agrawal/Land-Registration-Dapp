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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            {!account ? (
              <button
                onClick={() => connectWallet(provider)}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 mb-4"
              >
                Connect to MetaMask
              </button>
            ) : (
              <p className="text-green-600 text-center mb-4">
                Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            )}

            {!registered || !verified ? (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Access Denied! </strong>
                <span className="block sm:inline">
                  You are not verified to add land.
                </span>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="flex flex-col">
                    <label className="leading-loose">Area (sqm)</label>
                    <Input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">City</label>
                    <Input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">State</label>
                    <Input
                      type="text"
                      value={stateLoc}
                      onChange={(e) => setStateLoc(e.target.value)}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">Price (ETH)</label>
                    <Input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">Property PID</label>
                    <Input
                      type="text"
                      value={propertyPID}
                      onChange={(e) => setPropertyPID(e.target.value)}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">Survey Number</label>
                    <Input
                      type="text"
                      value={surveyNum}
                      onChange={(e) => setSurveyNum(e.target.value)}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">Upload Land Image</label>
                    <div className="flex space-x-2">
                      <Input
                        type="file"
                        onChange={handleLandImageUpload}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                      />
                      <button
                        onClick={uploadFiles}
                        disabled={!landImage || uploadLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {uploadLoading ? "Uploading..." : "Upload Image"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">Upload Aadhar Card</label>
                    <div className="flex space-x-2">
                      <Input
                        type="file"
                        onChange={handleAadharDocumentUpload}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                      />
                      <button
                        onClick={uploadFiles}
                        disabled={!aadharDocument || uploadLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {uploadLoading ? "Uploading..." : "Upload Document"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center space-x-4">
                  <button
                    onClick={addLand}
                    disabled={transactionLoading}
                    className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none hover:bg-blue-600"
                  >
                    {transactionLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Add Land"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          <Link
            to="/sellerDashboard"
            className={`block text-center py-2 px-4 rounded w-2/3 mx-auto my-5 ${
              verified
                ? "bg-blue-500 hover:bg-blue-700 text-white transition duration-300"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={(e) => !verified && e.preventDefault()}
          >
            Return to Seller Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddLand;

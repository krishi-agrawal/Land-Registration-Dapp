import React, { useState, useCallback, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import axios from "axios";
import { toast } from "react-toastify";

// Custom hook for polygon management
const usePolygonManager = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const updateCoordinates = useCallback((coordinates) => {
    setFormData((prev) => ({
      ...prev,
      coordinates,
    }));
  }, []);

  const clearCoordinates = useCallback(() => {
    updateCoordinates([]);
  }, [updateCoordinates]);

  return {
    formData,
    updateCoordinates,
    clearCoordinates,
  };
};

// Custom hook for Leaflet icon initialization
const useLeafletIconFix = () => {
  useMemo(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);
};

// PolygonMapForm Component
const PolygonMapForm = ({
  initialCenter = [51.505, -0.09],
  initialZoom = 13,
  onPolygonChange,
}) => {
  useLeafletIconFix();

  const { formData, updateCoordinates, clearCoordinates } = usePolygonManager({
    name: "",
    description: "",
    coordinates: [],
  });

  const handleCreated = useCallback(
    (e) => {
      const { layer } = e;
      if (layer?.getLatLngs) {
        const polygonCoords = layer
          .getLatLngs()[0]
          .map(({ lat, lng }) => [lat, lng]);
        console.log(polygonCoords);
        updateCoordinates(polygonCoords);
        onPolygonChange?.(polygonCoords);
      }
    },
    [updateCoordinates, onPolygonChange]
  );

  const handleEdited = useCallback(
    (e) => {
      const { layers } = e;
      layers.eachLayer((layer) => {
        if (layer?.getLatLngs) {
          const polygonCoords = layer
            .getLatLngs()[0]
            .map(({ lat, lng }) => [lat, lng]);
          updateCoordinates(polygonCoords);
          onPolygonChange?.(polygonCoords);
        }
      });
    },
    [updateCoordinates, onPolygonChange]
  );

  const handleDeleted = useCallback(() => {
    clearCoordinates();
    onPolygonChange?.([]);
  }, [clearCoordinates, onPolygonChange]);

  const drawControls = useMemo(
    () => ({
      rectangle: false,
      polyline: false,
      circle: false,
      circlemarker: false,
      marker: false,
    }),
    []
  );

  return (
    <div
      className="polygon-map-container"
      style={{ height: "500px", width: "100%" }}
    >
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "80%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={drawControls}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

const CityCoordinates = {
  mumbai: { coords: [19.076, 72.8777], state: "Maharashtra" },
  delhi: { coords: [28.7041, 77.1025], state: "Delhi" },
  bangalore: { coords: [12.9716, 77.5946], state: "Karnataka" },
  hyderabad: { coords: [17.385, 78.4867], state: "Telangana" },
  chennai: { coords: [13.0827, 80.2707], state: "Tamil Nadu" },
  kolkata: { coords: [22.5726, 88.3639], state: "West Bengal" },
  pune: { coords: [18.5204, 73.8567], state: "Maharashtra" },
  ahmedabad: { coords: [23.0225, 72.5714], state: "Gujarat" },
  jaipur: { coords: [26.9124, 75.7873], state: "Rajasthan" },
  lucknow: { coords: [26.8467, 80.9462], state: "Uttar Pradesh" },
};

const AddLand = () => {
  const apiKey = "3df76883d3f7b0b7bf14";
  const apiSecret =
    "318a60d3bf31978bd8bd9bb490e2153201e5600efdbf49ac167aa15cc2ca7dfb";
  const pinataBaseUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const {
    account,
    contract,
    isSeller,
    isVerified,
    isRejected,
    loading: walletLoading,
  } = useWallet();
  const navigate = useNavigate();

  // Split form state into logical sections
  const [step, setStep] = useState(1);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India center

  // Basic property information
  const [propertyInfo, setPropertyInfo] = useState({
    city: "",
    area: "",
    state: "",
    price: "",
    propertyPID: "",
    surveyNum: "",
  });

  // Document uploads
  const [documents, setDocuments] = useState({
    landImage: null,
    aadharDocument: null,
  });

  // Upload states
  const [uploadState, setUploadState] = useState({
    uploadLoading: false,
    imageUrl: "",
    documentUrl: "",
    transactionLoading: false,
  });

  // Coordinates for the property
  const [coordinates, setCoordinates] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletLoading) {
      setLoading(false);
    }
  }, [walletLoading]);

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
  function prepareCoordinates(coordinates) {
    const lats = [];
    const longs = [];

    coordinates.forEach(([lat, lng]) => {
      lats.push(Math.round(lat * 1e7));
      longs.push(Math.round(lng * 1e7));
    });

    return { lats, longs };
  }
  const uploadFiles = async () => {
    if (!documents.landImage || !documents.aadharDocument) {
      toast.warn("Please select both land image and Aadhar document");
      return;
    }

    setUploadState((prev) => ({ ...prev, uploadLoading: true }));

    try {
      const imageHash = await uploadToPinata(
        documents.landImage,
        "land_image.jpg"
      );
      const documentHash = await uploadToPinata(
        documents.aadharDocument,
        "aadhar_document1.pdf"
      );

      setUploadState((prev) => ({
        ...prev,
        imageUrl: imageHash,
        documentUrl: documentHash,
        uploadLoading: false,
      }));

      toast.success("Files uploaded successfully");
      return { imageHash, documentHash };
    } catch (error) {
      setUploadState((prev) => ({ ...prev, uploadLoading: false }));
      return null;
    }
  };

  const addLand = async () => {
    const { area, city, state, price, propertyPID, surveyNum } = propertyInfo;
    const { imageUrl, documentUrl } = uploadState;
    const { lats, longs } = prepareCoordinates(coordinates);

    // Validate inputs
    if (!area || !city || !state || !price || !propertyPID || !surveyNum) {
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
    if (!lats || !longs) {
      toast.warn("Please mark the coordinates");
    }
    setUploadState((prev) => ({ ...prev, transactionLoading: true }));

    try {
      setUploadState((prev) => ({ ...prev, transactionLoading: true }));
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(price);

      //Call contract method
      const tx = await contract.addLand(
        parseInt(area),
        city,
        state,
        priceInWei,
        parseInt(propertyPID),
        parseInt(surveyNum),
        imageUrl,
        documentUrl,
        lats,
        longs
      );

      await tx.wait();
      toast.success("Land added successfully!");
      navigate("/sellerdashboard");
    } catch (error) {
      console.error("Error adding land:", error);
      toast.error("Transaction failed: " + error.message);
    } finally {
      setUploadState((prev) => ({ ...prev, transactionLoading: false }));
    }
  };

  const handlePolygonChange = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  const handleLandImageUpload = (event) => {
    const file = event.target.files[0];
    setDocuments((prev) => ({ ...prev, landImage: file }));
  };

  const handleAadharDocumentUpload = (event) => {
    const file = event.target.files[0];
    setDocuments((prev) => ({ ...prev, aadharDocument: file }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "city") {
      const cityKey = value.toLowerCase();
      if (CityCoordinates[cityKey]) {
        setPropertyInfo((prev) => ({
          ...prev,
          state: CityCoordinates[cityKey].state,
        }));
      }
    }
  };

  // Handle city selection - set map center
  const handleCitySelect = () => {
    const cityKey = propertyInfo.city.toLowerCase();
    if (CityCoordinates[cityKey]) {
      setMapCenter(CityCoordinates[cityKey].coords);
      setPropertyInfo((prev) => ({
        ...prev,
        state: CityCoordinates[cityKey].state,
      }));
    }
    setStep(2);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...propertyInfo,
      ...documents,
      coordinates,
      imageUrl: uploadState.imageUrl,
      documentUrl: uploadState.documentUrl,
    };
    console.log("Form submitted:", formData);
    addLand();
  };
  if (walletLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const ProcessingModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 my-8 shadow-xl transform transition-all">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Processing Transaction
            </h3>
            <p className="text-gray-600 text-center">
              Your land registration is being processed on the blockchain. This
              may take a few moments. Please don't close this window.
            </p>
          </div>
        </div>
      </div>
    );
  };
  if (uploadState.transactionLoading) {
    return <ProcessingModal />;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Property Registration
          </h1>
          <p className="text-gray-600 mt-1">
            Register your property details and boundaries
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Property Information</h2>
                <p className="text-blue-100 mt-1">
                  Complete all required fields to register your property
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      City
                    </label>
                    <select
                      name="city"
                      value={propertyInfo.city}
                      onChange={handleInputChange}
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a city</option>
                      {Object.keys(CityCoordinates).map((city) => (
                        <option
                          key={city}
                          value={city.charAt(0).toUpperCase() + city.slice(1)}
                        >
                          {city.charAt(0).toUpperCase() + city.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Area (sqm)
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={propertyInfo.area}
                      onChange={handleInputChange}
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={propertyInfo.state}
                      readOnly
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Price (in ₹)
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={propertyInfo.price}
                      onChange={handleInputChange}
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Property PID
                    </label>
                    <input
                      type="text"
                      name="propertyPID"
                      value={propertyInfo.propertyPID}
                      onChange={handleInputChange}
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Survey Number
                    </label>
                    <input
                      type="text"
                      name="surveyNum"
                      value={propertyInfo.surveyNum}
                      onChange={handleInputChange}
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Upload Land Image
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      name="landImage"
                      onChange={handleLandImageUpload}
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={uploadFiles}
                      disabled={
                        !documents.landImage || uploadState.uploadLoading
                      }
                      className={`px-4 py-2.5 rounded-lg text-white font-medium ${
                        !documents.landImage || uploadState.uploadLoading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      }`}
                    >
                      {uploadState.uploadLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
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
                    Upload Land Document
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      name="aadharDocument"
                      onChange={handleAadharDocumentUpload}
                      className="shadow-sm border border-gray-200 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={uploadFiles}
                      disabled={
                        !documents.aadharDocument || uploadState.uploadLoading
                      }
                      className={`px-4 py-2.5 rounded-lg text-white font-medium ${
                        !documents.aadharDocument || uploadState.uploadLoading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      }`}
                    >
                      {uploadState.uploadLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
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
                          Uploading...
                        </div>
                      ) : (
                        "Upload Document"
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-between ">
                  <button
                    onClick={() => navigate("/sellerdashboard")}
                    className="inline-flex items-center px-4 py-2 rounded-lg font-medium border border-gray-200 text-white hover:bg-gray-50  bg-gradient-to-r from-blue-500 to-blue-600  hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow transition-all mr-5"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Return to Dashboard
                  </button>
                  <button
                    onClick={handleCitySelect}
                    disabled={
                      !propertyInfo.city ||
                      !propertyInfo.area ||
                      !propertyInfo.state ||
                      !propertyInfo.price ||
                      !propertyInfo.propertyPID ||
                      !propertyInfo.surveyNum
                    }
                    className="ml-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg w-full flex justify-center items-center shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Continue to Map
                    <svg
                      className="h-5 w-5 ml-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Draw Your Property Boundary
                </h2>
                <p className="text-gray-600 mb-6">
                  Please draw the polygon representing your property boundaries
                </p>

                <div className="h-96 mb-6 rounded-lg overflow-hidden border border-gray-200">
                  <PolygonMapForm
                    initialCenter={mapCenter}
                    initialZoom={12}
                    onPolygonChange={handlePolygonChange}
                  />
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-6 rounded-lg flex items-center transition-colors"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={coordinates.length === 0}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-6 rounded-lg flex items-center shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Submit Property Details
                    <svg
                      className="h-5 w-5 ml-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLand;

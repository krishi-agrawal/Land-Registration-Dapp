import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useWallet } from "../contexts/WalletContext";
import { Link, useNavigate } from "react-router-dom";
// Fix for leaflet marker icons

const ViewLandMap = () => {
  const navigate = useNavigate();
  const { landId } = useParams(); // Get landId from URL
  const { contract } = useWallet(); // Get contract from wallet context
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);
  // Convert landId from string to number
  const numericLandId = parseInt(landId);
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default India center

  useEffect(() => {
    const fetchLandData = async () => {
      try {
        setLoading(true);

        // Get boundary point count
        const pointCount = await contract.getBoundaryPointCount(landId);

        // Get boundary coordinates
        const [lats, lngs] = await contract.getLandBoundary(landId);

        // Convert from int32 to decimal coordinates
        const processedCoords = [];
        for (let i = 0; i < pointCount; i++) {
          processedCoords.push([
            lats[i] / 1e7, // Convert back from multiplied value
            lngs[i] / 1e7,
          ]);
        }

        setCoordinates(processedCoords);

        // Calculate center point if we have coordinates
        if (processedCoords.length > 0) {
          const latSum = processedCoords.reduce((sum, [lat]) => sum + lat, 0);
          const lngSum = processedCoords.reduce((sum, [, lng]) => sum + lng, 0);
          setCenter([
            latSum / processedCoords.length,
            lngSum / processedCoords.length,
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching land data:", err);
        setError("Failed to load land boundary data");
        setLoading(false);
      }
    };

    if (landId && contract) {
      fetchLandData();
    }
  }, [landId, contract]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (coordinates.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No boundary coordinates found for this land
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)} // Goes back to previous page
          className="inline-flex items-center px-4 py-2 rounded-lg font-medium border border-gray-200 text-white hover:bg-gray-50  bg-gradient-to-r from-blue-500 to-blue-600  hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow transition-all"
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
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          Back to Land Details
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Land Boundary (ID: {landId.toString()})
      </h2>
      <div className="h-96 rounded-md overflow-hidden border border-gray-300">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polygon
            positions={coordinates}
            color="blue"
            fillColor="blue"
            fillOpacity={0.2}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium">Land ID: {landId.toString()}</p>
                <p>Boundary Points: {coordinates.length}</p>
              </div>
            </Popup>
          </Polygon>
        </MapContainer>
      </div>
      <div className="mt-4 bg-gray-50 p-3 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Boundary Coordinates
        </h3>
        <div className="text-xs font-mono text-gray-600 overflow-auto max-h-32">
          {coordinates.map(([lat, lng], index) => (
            <div key={index}>
              Point {index + 1}: {lat.toFixed(7)}, {lng.toFixed(7)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewLandMap;

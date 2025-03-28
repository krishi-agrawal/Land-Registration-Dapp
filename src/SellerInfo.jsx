import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Registry from "../artifacts/contracts/Registry.sol/Registry.json";
import { useNavigate } from "react-router-dom";

const SellerInfo = () => {
  // State variables
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [landContract, setLandContract] = useState(null);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingTx, setProcessingTx] = useState(false);
  const [isInspector, setIsInspector] = useState(true);
  const [sellersList, setSellersList] = useState([]);

  const navigate = useNavigate();

  // Connect to MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);

      connectWallet(ethersProvider);
    } else {
      alert("Please install MetaMask!");
      // setLoading(false);
    }
  }, []);

  const connectWallet = async (ethersProvider) => {
    try {
      const accounts = await ethersProvider.send("eth_requestAccounts", []);
      const ethersSigner = ethersProvider.getSigner();
      setSigner(ethersSigner);
      setAccount(accounts[0]);

      // Get network and contract
      // const { chainId } = await ethersProvider.getNetwork();
      // const deployedNetwork = Land.networks[chainId];

      // if (!deployedNetwork) {
      //   alert("Please connect to the correct network");
      //   setLoading(false);
      //   return;
      // }

      const landContractInstance = new ethers.Contract(
        "0x273d42dE3e74907cD70739f58DC717dF2872F736",
        Registry.abi,
        ethersSigner
      );
      setLandContract(landContractInstance);
      console.log("COntract:", landContractInstance);
      console.log(
        "Is seller: ",
        await landContractInstance.isSeller(
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        )
      );
      console.log("Connected to contract:", await landContractInstance.address);
      // console.log("Available methods:", Object.keys(landContractInstance.functions));

      // Check if current user is an inspector
      // const verificationStatus = await landContractInstance.isLandInspector(accounts[0]);
      // setIsInspector(verificationStatus);

      // Load sellers data
      // setLoading(false);
      await loadSellerData(landContractInstance);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect. Please check your wallet connection.");
    } finally {
    }
  };

  // Load all seller data
  const loadSellerData = async (contract) => {
    try {
      // setLoading(true);

      // Get total sellers count
      // const aa = await landContract.sellers (0)
      // console.log("aaa: ", aa)
      console.log(
        "Is seller: ",
        contract.isSeller("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      );
      let sellersCount = await contract.sellersCount();
      console.log("Sellers count:", sellersCount);

      // Create array to store seller info
      const sellers = [];

      // Loop through each seller index to get the address first
      for (let i = 0; i < sellersCount; i++) {
        // Get seller address from the sellers array using the auto-generated getter
        const address = await contract.sellers(i);

        // Get seller details, verification status, and rejection status
        const [sellerDetails, isVerified, isRejected] = await Promise.all([
          contract.SellerMapping(address),
          contract.SellerVerification(address),
          contract.SellerRejection(address),
        ]);

        // Format seller data
        sellers.push({
          id: i + 1,
          address: address,
          name: sellerDetails.name,
          age: sellerDetails.age.toNumber(),
          aadharNumber: sellerDetails.aadharNumber,
          panNumber: sellerDetails.panNumber,
          ownedLands: sellerDetails.landsOwned,
          document: sellerDetails.document,
          isVerified: isVerified,
          isRejected: isRejected,
        });
      }

      setSellersList(sellers);
    } catch (error) {
      console.error("Error loading seller data:", error);
      alert("Failed to load seller information");
    } finally {
      setLoading(false);
    }
  };

  // Verify a seller
  const verifySeller = async (address) => {
    try {
      setProcessingTx(true);
      console.log("Land contract in Verify Seller: ", landContract);
      const tx = await landContract.verifySeller(address, {
        from: account,
        // gasLimit: 2100000
      });
      alert(
        "Verification transaction submitted. Please wait for confirmation..."
      );

      // Wait for transaction to be mined
      await tx.wait();
      alert("Seller verified successfully!");

      // Reload seller data
      await loadSellerData(landContract);
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to verify seller. Please try again.");
    } finally {
      setProcessingTx(false);
    }
  };

  // Reject a seller
  const rejectSeller = async (address) => {
    try {
      setProcessingTx(true);
      const tx = await landContract.rejectSeller(address, {
        from: account,
        gasLimit: 2100000,
      });
      alert("Rejection transaction submitted. Please wait for confirmation...");

      // Wait for transaction to be mined
      await tx.wait();
      alert("Seller rejected successfully!");

      // Reload seller data
      await loadSellerData(landContract);
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject seller. Please try again.");
    } finally {
      setProcessingTx(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authorized view
  if (!isInspector) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-700">
            You are not verified to view this page. Only verified Land
            Inspectors can access the seller verification dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Main content - Seller table
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Processing overlay */}
      {processingTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">
              Processing transaction...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while the blockchain confirms your action.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Seller Verification Dashboard
        </h1>
        <p className="text-gray-600">
          Verify or reject seller applications for the land registration system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sellers</p>
              <p className="text-2xl font-bold text-gray-800">
                {sellersList.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Verified Sellers
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {sellersList.filter((seller) => seller.isVerified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Pending Verification
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  sellersList.filter(
                    (seller) => !seller.isVerified && !seller.isRejected
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Sellers Information
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Account Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Age
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aadhar Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pan Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Owned Lands
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aadhar Document
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellersList.length > 0 ? (
                sellersList.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {seller.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {seller.address.slice(0, 6) +
                        "..." +
                        seller.address.slice(-4)}
                      <button
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        onClick={() =>
                          navigator.clipboard.writeText(seller.address)
                        }
                        title="Copy address"
                      >
                        📋
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.age.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.aadharNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.panNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.ownedLands.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a
                        href={`https://ipfs.io/ipfs/${seller.document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Document
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.isVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : seller.isRejected ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Rejected
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => verifySeller(seller.address)}
                        disabled={seller.isVerified || seller.isRejected}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          seller.isVerified || seller.isRejected
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        }`}
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => rejectSeller(seller.address)}
                        disabled={seller.isVerified || seller.isRejected}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          seller.isVerified || seller.isRejected
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        }`}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No sellers registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;

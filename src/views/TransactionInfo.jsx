import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const TransactionInfo = () => {
  const navigate = useNavigate();
  const {
    account,
    contract: landContract,
    isLandInspector: isVerified,
    loading: walletLoading,
  } = useWallet();

  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferStatus, setTransferStatus] = useState({});

  useEffect(() => {
    const fetchLandData = async (contract) => {
      try {
        // Get total lands count
        const count = await contract.getLandsCount();
        const landsCount = parseInt(count.toString());

        // Create array of land IDs (1 to landsCount)
        const landIds = Array.from({ length: landsCount }, (_, i) => i + 1);

        // Step 1: Check all isRequested statuses in parallel
        const isRequestedPromises = landIds.map((id) =>
          contract.isRequested(id)
        );
        const isRequestedResults = await Promise.all(isRequestedPromises);

        // Step 2: Filter only IDs that are requested
        const requestedLandIds = landIds.filter(
          (_, index) => isRequestedResults[index]
        );

        // Step 3: For filtered IDs, fetch all details in parallel
        const landDetailsPromises = requestedLandIds.map(async (landId) => {
          // Use Promise.all to fetch all details for a single land in parallel
          const [
            owner,
            area,
            city,
            state,
            price,
            pid,
            surveyNumber,
            request,
            isPaid,
          ] = await Promise.all([
            contract.getLandOwner(landId),
            contract.getArea(landId),
            contract.getCity(landId),
            contract.getState(landId),
            contract.getPrice(landId),
            contract.getPID(landId),
            contract.getSurveyNumber(landId),
            contract.getRequestDetails(landId),
            contract.isPaid(landId),
          ]);

          const transferCompleted = request[1] === owner;

          return {
            originalId: landId,
            owner,
            area: area.toString(),
            city,
            state,
            price: ethers.utils.formatEther(price),
            pid: pid.toNumber(),
            surveyNumber: surveyNumber.toString(),
            request,
            isPaid,
            transferCompleted,
          };
        });

        // Wait for all land details to be fetched
        const landsList = await Promise.all(landDetailsPromises);

        // Add sequential IDs
        const landsWithSequentialIds = landsList.map((land, index) => ({
          ...land,
          id: index + 1,
        }));

        setLands(landsWithSequentialIds);
      } catch (error) {
        console.error("Error fetching land data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (landContract) {
      fetchLandData(landContract);
    }
  }, [landContract]);

  const landTransfer = async (landId, newOwner) => {
    try {
      setTransferStatus((prev) => ({ ...prev, [landId]: false }));

      const tx = await landContract.LandOwnershipTransfer(landId, newOwner, {
        from: account,
        gasLimit: 2100000,
      });

      await tx.wait();

      await landContract.getRequestDetails(landId); // optional re-fetch

      setLands((prevLands) =>
        prevLands.map((land) =>
          land.id === landId
            ? { ...land, transferCompleted: false, isApproved: true }
            : land
        )
      );

      window.location.reload();
    } catch (error) {
      console.error("Transfer error:", error);
      setTransferStatus((prev) => ({ ...prev, [landId]: true }));
      alert("Land transfer verification failed. See console for details.");
    }
  };

  if (isLoading || walletLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600">
            You are not authorized to view this page
          </h1>
          <p className="mt-2 text-gray-600">
            Only verified land inspectors can access this functionality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Lands Information</h2>
          <p className="text-blue-100">Transfer ownership verification panel</p>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  "Owner",
                  "Buyer",
                  "Seller",
                  "Area",
                  "City",
                  "State",
                  "Price (ETH)",
                  "PID",
                  "Survey #",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lands.map((land) => {
                const isDisabled = !land.isPaid || land.transferCompleted;

                return (
                  <tr
                    key={land.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {`${land.owner.slice(0, 6)}...${land.owner.slice(-4)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {`${land.request[1].slice(
                        0,
                        6
                      )}...${land.request[1].slice(-4)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {`${land.request[0].slice(
                        0,
                        6
                      )}...${land.request[0].slice(-4)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.pid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.surveyNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          landTransfer(land.originalId, land.request[1])
                        }
                        disabled={isDisabled}
                        className={`px-4 py-2 rounded-md text-white shadow-sm transition-all ${
                          isDisabled
                            ? "bg-gray-400 cursor-not-allowed opacity-60"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                        }`}
                      >
                        {land.transferCompleted
                          ? "Verified"
                          : "Verify Transfer"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfo;

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const MakePayment = () => {
  const {
    account,
    contract,
    isBuyer: registered,
    isVerified: verified,
    isRejected: rejected,
    loading,
  } = useWallet();
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandsData = async () => {
      if (!contract || !account) return;

      try {
        setIsLoading(true);

        // Get total lands count in a single call
        const count = await contract.getLandsCount();
        const landsCount = parseInt(count.toString());

        // First get all request details in a batch to filter relevant lands
        const requestPromises = [];
        for (let i = 1; i <= landsCount; i++) {
          requestPromises.push(contract.getRequestDetails(i));
        }

        const allRequests = await Promise.all(requestPromises);

        // Filter land IDs that belong to current user before fetching additional data
        const relevantLandIds = [];
        for (let i = 0; i < allRequests.length; i++) {
          const requestAddress = allRequests[i][1].toLowerCase();
          if (requestAddress === account.toLowerCase() && allRequests[i][3]) {
            relevantLandIds.push(i + 1); // Add 1 because IDs start from 1
          }
        }

        // Only fetch additional data for lands that belong to the current user
        const landDataPromises = relevantLandIds.map((id) => {
          return Promise.all([
            contract.getLandOwner(id),
            contract.getPrice(id),
            contract.isPaid(id),
          ]).then(([owner, price, isPaid]) => ({
            originalId: id,
            owner,
            price: ethers.utils.formatEther(price),
            isPaid,
          }));
        });

        const landsList = await Promise.all(landDataPromises);

        // Add sequential IDs for display
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

    fetchLandsData();
  }, [contract, account]);

  const makePayment = async (sellerAddress, price, landId) => {
    try {
      const etherAmount = (parseFloat(price) * 57) / 10000000;
      const tx = await contract.payment(sellerAddress, landId, {
        from: account,
        value: ethers.utils.parseEther(etherAmount.toFixed(8)),
        gasLimit: 2100000,
      });

      await tx.wait();

      // Update only the specific land that was paid for instead of refetching all data
      setLands((prevLands) =>
        prevLands.map((land) =>
          land.originalId === landId ? { ...land, isPaid: true } : land
        )
      );
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. See console for details.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Connecting to contract...
          </h1>
        </div>
      </div>
    );
  }

  if (!registered) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600">
            You are not registered as a buyer
          </h1>
          <p className="mt-2 text-gray-600">
            Please register as a buyer to make payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Payment Center</h1>
          <p className="text-gray-600 mt-1">
            Complete your land purchase transactions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Pending Payments</h2>
                <p className="text-blue-100 mt-1">
                  Complete your approved land transactions
                </p>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg flex items-center gap-3">
                <p className="text-sm font-medium text-white">
                  Exchange Rate: ₹ 1 = 0.0000057 ETH
                </p>
                <button
                  onClick={() => navigate("/buyerDashboard")}
                  className="flex items-center text-white bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {lands.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending land payments found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg">
                        Land ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        Owner Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        Price (in ₹)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lands.map((land, index) => (
                      <tr
                        key={land.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{land.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          <div className="flex items-center">
                            {`${land.owner.substring(
                              0,
                              6
                            )}...${land.owner.substring(38)}`}
                            <button
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title="Copy address"
                              onClick={() =>
                                navigator.clipboard.writeText(land.owner)
                              }
                            >
                              <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          ₹{land.price}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {land.isPaid ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg
                                className="h-3 w-3 mr-1"
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
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <svg
                                className="h-3 w-3 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              makePayment(
                                land.owner,
                                land.price,
                                land.originalId
                              )
                            }
                            disabled={land.isPaid}
                            className={`inline-flex items-center px-4 py-2 rounded-lg transition-all ${
                              land.isPaid
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow"
                            }`}
                          >
                            {land.isPaid ? (
                              <>
                                <svg
                                  className="h-4 w-4 mr-1.5"
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
                                Completed
                              </>
                            ) : (
                              <>
                                <svg
                                  className="h-4 w-4 mr-1.5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                  />
                                </svg>
                                Pay Now
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;

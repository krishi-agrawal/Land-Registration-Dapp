import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Land from "../../artifacts/contracts/Registry.sol/Registry.json";

const MakePayment = () => {
  const [landContract, setLandContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [registered, setRegistered] = useState(true);
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!localStorage.getItem("pageLoaded")) {
          localStorage.setItem("pageLoaded", "true");
          window.location.reload();
        }

        if (window.ethereum) {
          const ethersProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          await connectWallet(ethersProvider);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        alert("Failed to initialize. Check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const connectWallet = async (provider) => {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const ethersSigner = provider.getSigner();
      setSigner(ethersSigner);
      setAccount(accounts[0]);

      const contractInstance = new ethers.Contract(
        "0x273d42dE3e74907cD70739f58DC717dF2872F736",
        Land.abi,
        ethersSigner
      );

      setLandContract(contractInstance);

      const isBuyer = await contractInstance.isBuyer(accounts[0]);
      setRegistered(isBuyer);

      await fetchLandsData(contractInstance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const fetchLandsData = async (contract, currentAddress) => {
    try {
      setIsLoading(true);
      const count = await contract.getLandsCount();
      const landsCount = parseInt(count.toString());

      const landsList = [];
      for (let i = 1; i <= landsCount; i++) {
        const [owner, price, isPaid, request] = await Promise.all([
          contract.getLandOwner(i),
          contract.getPrice(i),
          contract.isPaid(i),
          contract.getRequestDetails(i),
        ]);

        if (request[1].toLowerCase() === currentAddress.toLowerCase()) {
          landsList.push({
            originalId: i,
            owner,
            price: ethers.utils.formatEther(price),
            isPaid,
          });
        }
      }

      const landsWithSequentialIds = landsList.map((land, index) => ({
        ...land,
        id: index + 1,
      }));

      setLands(landsWithSequentialIds);
    } catch (error) {
      console.error("Error fetching land data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const makePayment = async (sellerAddress, price, landId) => {
    try {
      const etherAmount = (parseFloat(price) * 57) / 10000000;
      const tx = await landContract.payment(sellerAddress, landId, {
        from: account,
        value: ethers.utils.parseEther(etherAmount.toFixed(8)),
        gasLimit: 2100000,
      });

      await tx.wait();
      await fetchLandsData(landContract, account);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. See console for details.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-blue-600">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!landContract) {
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
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Pending Payments</h2>
          <p className="text-blue-100">Complete your land transactions</p>
          <p className="text-blue-100 text-sm mt-1">₹ 1 = 0.0000057 ETH</p>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (in ₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lands.map((land) => (
                  <tr
                    key={land.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {`${land.owner.substring(0, 6)}...${land.owner.substring(
                        38
                      )}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {land.isPaid ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          makePayment(land.owner, land.price, land.originalId)
                        }
                        disabled={land.isPaid}
                        className={`px-4 py-2 rounded-md text-white shadow-sm transition-all ${
                          land.isPaid
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                        }`}
                      >
                        {land.isPaid ? "Completed" : "Pay Now"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;

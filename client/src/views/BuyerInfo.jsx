import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Land from "../artifacts/Land.json";
import { Spinner } from "react-bootstrap";
import emailjs from "emailjs-com";

const BuyerInfo = () => {
  const [landInstance, setLandInstance] = useState(null);
  const [account, setAccount] = useState("");
  const [verified, setVerified] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize Ethers.js and contract instance
  useEffect(() => {
    const init = async () => {
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }

      try {
        // Connect to Ethereum provider (MetaMask)
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Get contract instance
        const networkId = await provider.getNetwork();
        const deployedNetwork = Land.networks[networkId.chainId];
        const instance = new ethers.Contract(
          deployedNetwork.address,
          Land.abi,
          signer
        );
        setLandInstance(instance);

        // Check if the user is verified as a land inspector
        const isVerified = await instance.isLandInspector(address);
        setVerified(isVerified);

        // Fetch all buyers
        const buyersCount = await instance.getBuyersCount();
        const buyersData = [];

        for (let i = 0; i < buyersCount; i++) {
          const buyerAddress = await instance.getBuyer(i);
          const buyerDetails = await instance.getBuyerDetails(buyerAddress);
          const isVerifiedBuyer = await instance.isVerified(buyerAddress);
          const isRejected = await instance.isRejected(buyerAddress);

          buyersData.push({
            id: i + 1,
            address: buyerAddress,
            name: buyerDetails[0],
            age: buyerDetails[5],
            email: buyerDetails[4],
            city: buyerDetails[1],
            aadhar: buyerDetails[6],
            pan: buyerDetails[2],
            document: buyerDetails[3],
            verified: isVerifiedBuyer,
            rejected: isRejected,
          });
        }

        setBuyers(buyersData);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing:", error);
        alert("Failed to load web3, accounts, or contract. Check console for details.");
      }
    };

    init();
  }, []);

  // Verify a buyer
  const verifyBuyer = async (buyerAddress) => {
    try {
      const tx = await landInstance.verifyBuyer(buyerAddress, {
        gasLimit: 2100000,
      });
      await tx.wait();
      window.location.reload(); // Reload to reflect changes
    } catch (error) {
      console.error("Error verifying buyer:", error);
    }
  };

  // Reject a buyer and send email
  const rejectBuyer = async (buyerAddress, email, name) => {
    try {
      // Send email
      const templateParams = {
        from_name: email,
        to_name: name,
        function: "request and buy any land/property",
      };

      await emailjs.send(
        "service_vrxa1ak",
        "template_zhc8m9h",
        templateParams
      );
      alert("Mail sent successfully");

      // Reject buyer
      const tx = await landInstance.rejectBuyer(buyerAddress, {
        gasLimit: 2100000,
      });
      await tx.wait();
      window.location.reload(); // Reload to reflect changes
    } catch (error) {
      console.error("Error rejecting buyer:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">
          You are not verified to view this page.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white">Buyers Information</h2>
          </div>
          <div className="p-6">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-6 text-left">#</th>
                  <th className="py-3 px-6 text-left">Account Address</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Age</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">City</th>
                  <th className="py-3 px-6 text-left">Aadhar Number</th>
                  <th className="py-3 px-6 text-left">Pan Number</th>
                  <th className="py-3 px-6 text-left">Aadhar Document</th>
                  <th className="py-3 px-6 text-left">Verification Status</th>
                  <th className="py-3 px-6 text-left">Verify Buyer</th>
                  <th className="py-3 px-6 text-left">Reject Buyer</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer) => (
                  <tr key={buyer.id} className="border-b">
                    <td className="py-4 px-6">{buyer.id}</td>
                    <td className="py-4 px-6">{buyer.address}</td>
                    <td className="py-4 px-6">{buyer.name}</td>
                    <td className="py-4 px-6">{buyer.age}</td>
                    <td className="py-4 px-6">{buyer.email}</td>
                    <td className="py-4 px-6">{buyer.city}</td>
                    <td className="py-4 px-6">{buyer.aadhar}</td>
                    <td className="py-4 px-6">{buyer.pan}</td>
                    <td className="py-4 px-6">
                      <a
                        href={`https://ipfs.io/ipfs/${buyer.document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View Document
                      </a>
                    </td>
                    <td className="py-4 px-6">{buyer.verified.toString()}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => verifyBuyer(buyer.address)}
                        disabled={buyer.verified || buyer.rejected}
                        className={`px-4 py-2 rounded ${
                          buyer.verified || buyer.rejected
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-700"
                        } text-white font-bold`}
                      >
                        Verify
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() =>
                          rejectBuyer(buyer.address, buyer.email, buyer.name)
                        }
                        disabled={buyer.verified || buyer.rejected}
                        className={`px-4 py-2 rounded ${
                          buyer.verified || buyer.rejected
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-700"
                        } text-white font-bold`}
                      >
                        Reject
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

export default BuyerInfo;
import React, { Component } from "react";
import { ethers } from "ethers";
// import LandContract from "./artifacts/Land.json";

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      role: null,
      redirect: null,
      landInspector: false,
      seller: false,
      buyer: false,
      account: "",
      contract: null,
    };
  }

  componentDidMount = async () => {
    try {
      if (!window.ethereum) {
        // alert("Please install MetaMask to continue.");
        return;
      }

      // Connect to Ethereum using ethers.js
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      // Load contract
      const deployedNetwork = LandContract.networks[network.chainId];
      const contract = new ethers.Contract(
        deployedNetwork.address,
        LandContract.abi,
        signer
      );

      const userAddress = await signer.getAddress();

      // Check roles
      const seller = await contract.isSeller(userAddress);
      const buyer = await contract.isBuyer(userAddress);
      const landInspector = await contract.isLandInspector(userAddress);

      this.setState({
        contract,
        account: accounts[0],
        seller,
        buyer,
        landInspector,
      });
    } catch (error) {
      console.error("Error connecting to contract:", error);
      alert("Failed to load blockchain data.");
    }
  };

  handleInputChange = (event) => {
    const selectedRole = event.target.value;
    this.setState({ role: selectedRole, redirect: `/Register${selectedRole}` });
  };

  submit = () => {
    if (this.state.redirect) {
      window.location.href = this.state.redirect;
    }
  };

  render() {
    const { seller, buyer, landInspector } = this.state;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="text-center mb-8 animate-fade-in">
          <img
            src="https://i.ibb.co/dJ3fxn69/logo.jpg" // Replace with your direct image URL
            alt="Land Registry Logo"
            className="h-32 w-32 mx-auto mb-4 rounded-lg border-4 border-white shadow-lg"
          />
          <h1 className="text-5xl font-bold text-white mb-2">Land Registry</h1>
          <p className="text-gray-200 text-lg">
            Secure & Transparent Property Management
          </p>
        </div>

        {seller || buyer || landInspector ? (
          <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Welcome Back!
            </h2>
            <div className="flex flex-col gap-4">
              <a
                href="/Seller/SellerDashboard"
                className={`py-3 px-6 text-white rounded-lg text-center transition-all ${
                  seller
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Seller Dashboard
              </a>
              <a
                href="/Buyer/BuyerDashboard"
                className={`py-3 px-6 text-white rounded-lg text-center transition-all ${
                  buyer
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Buyer Dashboard
              </a>
              <a
                href="/LI/LIdashboard"
                className={`py-3 px-6 text-white rounded-lg text-center transition-all ${
                  landInspector
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Land Inspector Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Get Started
            </h2>
            <p className="text-gray-600 mb-6">
              Select your role to begin your journey.
            </p>

            <div className="mb-6">
              <label
                htmlFor="role"
                className="block text-gray-700 font-medium mb-2"
              >
                Select Role
              </label>
              <select
                id="role"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={this.handleInputChange}
              >
                <option value="" disabled selected>
                  Select Role
                </option>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
              </select>
            </div>

            <button
              onClick={this.submit}
              className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition-all"
            >
              Register
            </button>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/Help"
            className="text-white underline hover:text-gray-200 transition-all"
          >
            Need Help?
          </a>
        </div>
      </div>
    );
  }
}
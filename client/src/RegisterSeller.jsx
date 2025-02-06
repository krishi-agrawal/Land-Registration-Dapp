import React, { Component } from "react";
import { ethers } from "ethers";
// import LandContract from "./artifacts/Land.json";
// import ipfs from "./ipfs";

class RegisterSeller extends Component {
  constructor(props) {
    super(props);

    this.state = {
      LandInstance: null,
      account: null,
      name: "",
      age: "",
      aadharNumber: "",
      panNumber: "",
      landsOwned: "",
      isVerified: false,
      buffer2: null,
      document: "",
      loading: false,
      error: "",
      success: "",
    };

    this.captureDoc = this.captureDoc.bind(this);
    this.addDoc = this.addDoc.bind(this);
  }

  async componentDidMount() {
    try {
      if (!window.ethereum) {
        this.setState({ error: "MetaMask not detected. Please install MetaMask." });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      const networkId = (await provider.getNetwork()).chainId;
      const deployedNetwork = LandContract.networks[networkId];
      const instance = new ethers.Contract(
        deployedNetwork.address,
        LandContract.abi,
        signer
      );

      this.setState({ LandInstance: instance, account });
    } catch (error) {
      this.setState({ error: "Failed to load web3, accounts, or contract." });
      console.error(error);
    }
  }

  addDoc = async () => {
    try {
      const result = await ipfs.files.add(this.state.buffer2);
      this.setState({ document: result[0].hash });
      console.log("Document hash:", this.state.document);
    } catch (error) {
      this.setState({ error: "Failed to upload document to IPFS." });
      console.error(error);
    }
  };

  registerSeller = async () => {
    const { name, age, aadharNumber, panNumber, landsOwned, document } = this.state;

    this.setState({ loading: true, error: "", success: "" });

    if (!name || !age || !aadharNumber || !panNumber || !landsOwned || !document) {
      this.setState({ error: "All fields are compulsory!", loading: false });
      return;
    }

    if (!Number(aadharNumber) || aadharNumber.length !== 12) {
      this.setState({ error: "Aadhar Number should be 12 digits long!", loading: false });
      return;
    }

    if (panNumber.length !== 10) {
      this.setState({ error: "Pan Number should be a 10 digit unique number!", loading: false });
      return;
    }

    if (!Number(age) || age < 21) {
      this.setState({ error: "Your age must be a number and at least 21 years old.", loading: false });
      return;
    }

    try {
      await this.addDoc();
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for IPFS upload

      await this.state.LandInstance.registerSeller(
        name,
        age,
        aadharNumber,
        panNumber,
        landsOwned,
        document,
        { from: this.state.account, gasLimit: 2100000 }
      );

      this.setState({ success: "Registration successful! Redirecting..." });
      setTimeout(() => {
        this.props.history.push("/Seller/SellerDashboard");
      }, 2000);
    } catch (error) {
      this.setState({ error: "Registration failed. Please try again.", loading: false });
      console.error(error);
    }
  };

  captureDoc(event) {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer2: Buffer.from(reader.result) });
      console.log("Buffer:", this.state.buffer2);
    };
  }

  render() {
    const { name, age, aadharNumber, panNumber, landsOwned, loading, error, success } = this.state;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Seller Registration</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6 text-center">
              {success}
            </div>
          )}

          <div className="space-y-5">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={name}
              onChange={(e) => this.setState({ name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Age"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={age}
              onChange={(e) => this.setState({ age: e.target.value })}
            />
            <input
              type="text"
              placeholder="Aadhar Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={aadharNumber}
              onChange={(e) => this.setState({ aadharNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="PAN Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={panNumber}
              onChange={(e) => this.setState({ panNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="Lands Owned"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={landsOwned}
              onChange={(e) => this.setState({ landsOwned: e.target.value })}
            />
            <input
              type="file"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onChange={this.captureDoc}
              accept="application/pdf"
            />
          </div>

          <button
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={this.registerSeller}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register as Seller"}
          </button>
        </div>
      </div>
    );
  }
}

export default RegisterSeller;
import React, { Component } from "react";
import { ethers } from "ethers";

class RegisterBuyer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LandInstance: null,
      signer: null,
      account: null,
      name: "",
      age: "",
      city: "",
      email: "",
      aadharNumber: "",
      panNumber: "",
      document: "",
      loading: false,
      error: "",
      success: "",
    };
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
      
      this.setState({ signer, account });
    } catch (error) {
      this.setState({ error: "Failed to connect to MetaMask." });
      console.error(error);
    }
  }

  RegisterBuyer = async () => {
    const { name, age, city, email, aadharNumber, panNumber, document } = this.state;
    
    this.setState({ loading: true, error: "", success: "" });
    
    if (!name || !age || !city || !email || !aadharNumber || !panNumber || !document) {
      this.setState({ error: "All fields are required.", loading: false });
      return;
    }
    
    try {
      this.setState({ success: "Registration successful! Redirecting..." });
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 2000);
    } catch (error) {
      this.setState({ error: "Registration failed. Please try again.", loading: false });
      console.error(error);
    }
  };

  render() {
    const { name, age, city, email, aadharNumber, panNumber, loading, error, success } = this.state;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Buyer Registration</h1>
          
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
              placeholder="City" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={city} 
              onChange={(e) => this.setState({ city: e.target.value })} 
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={email} 
              onChange={(e) => this.setState({ email: e.target.value })} 
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
              type="file" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onChange={(e) => this.setState({ document: e.target.files[0] })} 
            />
          </div>

          <button 
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={this.RegisterBuyer}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
    );
  }
}

export default RegisterBuyer;
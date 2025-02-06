import React, { Component } from "react";
import { ethers } from "ethers"; // Replace Web3 with Ethers.js
// import Land from "../artifacts/Land.json";
import { Spinner } from "react-bootstrap";
// import "../card.css";

// Drizzle components (optional, can be replaced with Ethers.js logic)
// import { DrizzleProvider } from "drizzle-react";
// import { LoadingContainer, ContractData } from "drizzle-react-components";

// Drizzle options
const drizzleOptions = {
  contracts: [Land],
};

var row = [];
var countarr = [];
var userarr = [];
var reqsarr = [];
var landOwner = [];

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      LandInstance: undefined,
      account: null,
      provider: null,
      count: 0,
      requested: false,
      registered: false,
    };
  }

  requestLand = (seller_address, land_id) => async () => {
    console.log(seller_address);
    console.log(land_id);

    await this.state.LandInstance.requestLand(seller_address, land_id, {
      from: this.state.account,
      gasLimit: 2100000,
    }).then((response) => {
      this.props.history.push("#");
    });

    // Reload
    window.location.reload(false);
  };

  componentDidMount = async () => {
    // For refreshing page only once
    if (!window.location.hash) {
      console.log(window.location.hash);
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      // Initialize Ethers.js provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();

      const networkId = await provider.getNetwork();
      const deployedNetwork = Land.networks[networkId.chainId];
      const instance = new ethers.Contract(
        deployedNetwork.address,
        Land.abi,
        signer
      );

      this.setState({ LandInstance: instance, provider: provider, account: account });

      const currentAddress = account;
      console.log(currentAddress);

      var registered = await instance.isBuyer(currentAddress);
      console.log(registered);
      this.setState({ registered: registered });

      var count = await instance.getLandsCount();
      count = parseInt(count);
      console.log(typeof count);
      console.log(count);

      var verified = await instance.isVerified(currentAddress);
      console.log(verified);

      countarr.push(<ContractData contract="Land" method="getLandsCount" />);
      userarr.push(<ContractData contract="Land" method="getSellersCount" />);
      reqsarr.push(<ContractData contract="Land" method="getRequestsCount" />);

      var rowsArea = [];
      var rowsCity = [];
      var rowsState = [];
      var rowsPrice = [];
      var rowsPID = [];
      var rowsSurvey = [];

      var dict = {};
      for (var i = 1; i < count + 1; i++) {
        var address = await instance.getLandOwner(i);
        dict[i] = address;
      }

      console.log(dict[1]);

      for (var i = 1; i < count + 1; i++) {
        rowsArea.push(<ContractData contract="Land" method="getArea" methodArgs={[i]} />);
        rowsCity.push(<ContractData contract="Land" method="getCity" methodArgs={[i]} />);
        rowsState.push(<ContractData contract="Land" method="getState" methodArgs={[i]} />);
        rowsPrice.push(<ContractData contract="Land" method="getPrice" methodArgs={[i]} />);
        rowsPID.push(<ContractData contract="Land" method="getPID" methodArgs={[i]} />);
        rowsSurvey.push(<ContractData contract="Land" method="getSurveyNumber" methodArgs={[i]} />);
      }

      for (var i = 0; i < count; i++) {
        var requested = await instance.isRequested(i + 1);
        row.push(
          <tr key={i} className="border-b">
            <td className="py-3 px-4">{i + 1}</td>
            <td className="py-3 px-4">{rowsArea[i]}</td>
            <td className="py-3 px-4">{rowsCity[i]}</td>
            <td className="py-3 px-4">{rowsState[i]}</td>
            <td className="py-3 px-4">{rowsPrice[i]}</td>
            <td className="py-3 px-4">{rowsPID[i]}</td>
            <td className="py-3 px-4">{rowsSurvey[i]}</td>
            <td className="py-3 px-4">
              <button
                onClick={this.requestLand(dict[i + 1], i + 1)}
                disabled={!verified || requested}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Request Land
              </button>
            </td>
          </tr>
        );
      }
      console.log(row);
    } catch (error) {
      alert(`Failed to load provider, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  render() {
    if (!this.state.provider) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

    if (!this.state.registered) {
      return (
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-500">
                You are not verified to view this page
              </h1>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-6">
          <DrizzleProvider options={drizzleOptions}>
            <LoadingContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-sky-400 to-sky-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="text-center">
                    <i className="fa fa-users text-4xl mb-4"></i>
                    <p className="text-lg">Total Sellers</p>
                    <p className="text-2xl font-bold">{userarr}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="text-center">
                    <i className="fa fa-landmark text-4xl mb-4"></i>
                    <p className="text-lg">Registered Lands Count</p>
                    <p className="text-2xl font-bold">{countarr}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="text-center">
                    <i className="fa fa-bell text-4xl mb-4"></i>
                    <p className="text-lg">Total Requests</p>
                    <p className="text-2xl font-bold">{reqsarr}</p>
                  </div>
                </div>
              </div>
            </LoadingContainer>
          </DrizzleProvider>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white shadow-lg rounded-lg">
              <div className="bg-gray-100 p-4 rounded-t-lg">
                <h5 className="text-xl font-bold">Profile</h5>
              </div>
              <div className="p-4">
                <button
                  href="/admin/buyerProfile"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  View Profile
                </button>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg">
              <div className="bg-gray-100 p-4 rounded-t-lg">
                <h5 className="text-xl font-bold">Owned Lands</h5>
              </div>
              <div className="p-4">
                <button
                  href="/admin/OwnedLands"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  View Your Lands
                </button>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg">
              <div className="bg-gray-100 p-4 rounded-t-lg">
                <h5 className="text-xl font-bold">Make Payments for Approved Land Requests</h5>
              </div>
              <div className="p-4">
                <button
                  href="/admin/MakePayment"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Make Payment
                </button>
              </div>
            </div>
          </div>

          <DrizzleProvider options={drizzleOptions}>
            <LoadingContainer>
              <div className="mt-6">
                <div className="bg-white shadow-lg rounded-lg">
                  <div className="bg-gray-100 p-4 rounded-t-lg">
                    <h4 className="text-2xl font-bold">Lands Info</h4>
                  </div>
                  <div className="p-4">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="py-3 px-4 text-left">#</th>
                          <th className="py-3 px-4 text-left">Area</th>
                          <th className="py-3 px-4 text-left">City</th>
                          <th className="py-3 px-4 text-left">State</th>
                          <th className="py-3 px-4 text-left">Price</th>
                          <th className="py-3 px-4 text-left">Property PID</th>
                          <th className="py-3 px-4 text-left">Survey Number</th>
                          <th className="py-3 px-4 text-left">Request Land</th>
                        </tr>
                      </thead>
                      <tbody>{row}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            </LoadingContainer>
          </DrizzleProvider>
        </div>
      </>
    );
  }
}

export default Dashboard;
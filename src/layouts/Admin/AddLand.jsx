import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Registry from "../../../artifacts/contracts/Registry.sol/Registry.json";
// import ipfs from "../ipfs";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormGroup,
  Input,
  Row,
  Col,
} from "reactstrap";
import { Spinner } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";

const AddLand = () => {
  const [landInstance, setLandInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [verified, setVerified] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);

  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [stateLoc, setStateLoc] = useState("");
  const [price, setPrice] = useState("");
  const [propertyPID, setPropertyPID] = useState("");
  const [surveyNum, setSurveyNum] = useState("");
  const [buffer, setBuffer] = useState(null);
  const [buffer2, setBuffer2] = useState(null);

  const navigate = useNavigate();

    useEffect(() => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      connectWallet()
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        const ethersSigner = provider.getSigner();
        setSigner(ethersSigner);
        setAccount(accounts[0]);

        const contractInstance = new ethers.Contract(
          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          Registry.abi,
          ethersSigner
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };

//   useEffect(() => {
//     const init = async () => {
//       try {
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         const userAccount = await signer.getAddress();

//         const network = await provider.getNetwork();
//         const deployedNetwork = LandContract.networks[network.chainId];

//         const contractInstance = new ethers.Contract(
//           "0x5FbDB2315678afecb367f032d93F642f64180aa3",
//           LandContract.abi,
//           signer
//         );

//         const [isVerified, isSeller] = await Promise.all([
//           contractInstance.isVerified(userAccount),
//           contractInstance.isSeller(userAccount),
//         ]);

//         setLandInstance(contractInstance);
//         setAccount(userAccount);
//         setVerified(isVerified);
//         setRegistered(isSeller);
//         setLoading(false);
//       } catch (error) {
//         console.error("Initialization error:", error);
//         alert("Failed to load contract. Check console for details.");
//       }
//     };

//     init();
//   }, []);

//   const captureFile = (event, isDocument = false) => {
//     event.preventDefault();
//     const file = event.target.files[0];
//     const reader = new FileReader();
//     reader.readAsArrayBuffer(file);
//     reader.onloadend = () => {
//       const bufferData = new Uint8Array(reader.result);
//       isDocument ? setBuffer2(bufferData) : setBuffer(bufferData);
//     };
//   };

// //   const uploadToIPFS = async (buffer) => {
// //     try {
// //       const result = await ipfs.files.add(buffer);
// //       return result[0].hash;
// //     } catch (error) {
// //       console.error("IPFS upload error:", error);
// //       alert("Error uploading to IPFS.");
// //       return null;
// //     }
// //   };

//   const addLand = async () => {
//     if (!area || !city || !stateLoc || !price || !propertyPID || !surveyNum || !buffer || !buffer2) {
//       alert("All fields are required!");
//       return;
//     }

//     if (isNaN(area) || isNaN(price)) {
//       alert("Land area and price must be numbers!");
//       return;
//     }

//     try {
//       const [ipfsHash, documentHash] = await Promise.all([
//         // uploadToIPFS(buffer),
//         // uploadToIPFS(buffer2),
//       ]);

//       if (!ipfsHash || !documentHash) return;

//       const tx = await landInstance.addLand(
//         area,
//         city,
//         stateLoc,
//         ethers.utils.parseEther(price),
//         propertyPID,
//         surveyNum,
//         ipfsHash,
//         documentHash,
//         { from: account, gasLimit: 2100000 }
//       );

//       await tx.wait();
//       alert("Land added successfully!");
//       navigate("/Seller/SellerDashboard");
//     } catch (error) {
//       console.error("Error adding land:", error);
//       alert("Transaction failed.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-100">
//         <Spinner animation="border" variant="primary" />
//       </div>
//     );
//   }

//   if (!registered || !verified) {
//     return (
//       <div className="content">
//         <Row>
//           <Col xs="6">
//             <Card className="card-chart">
//               <CardBody>
//                 <h1>You are not verified to view this page</h1>
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     );
//   }
const addLand = () => {

}
const captureFile = () => {

}

  return (
    <div className="content">
      <Row>
        <Col md="8">
          <Card>
            <CardHeader>
              <h5 className="title">Add Land</h5>
            </CardHeader>
            <CardBody>
              <FormGroup>
                <label>Area (sqm)</label>
                <Input type="text" value={area} onChange={(e) => setArea(e.target.value)} />
              </FormGroup>
              <FormGroup>
                <label>City</label>
                <Input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
              </FormGroup>
              <FormGroup>
                <label>State</label>
                <Input type="text" value={stateLoc} onChange={(e) => setStateLoc(e.target.value)} />
              </FormGroup>
              <FormGroup>
                <label>Price (ETH)</label>
                <Input type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
              </FormGroup>
              <FormGroup>
                <label>Property PID</label>
                <Input type="text" value={propertyPID} onChange={(e) => setPropertyPID(e.target.value)} />
              </FormGroup>
              <FormGroup>
                <label>Survey Number</label>
                <Input type="text" value={surveyNum} onChange={(e) => setSurveyNum(e.target.value)} />
              </FormGroup>
              <FormGroup>
                <label>Upload Land Image</label>
                <Input type="file" onChange={(e) => captureFile(e)} />
              </FormGroup>
              <FormGroup>
                <label>Upload Aadhar Card</label>
                <Input type="file" onChange={(e) => captureFile(e, true)} />
              </FormGroup>
            </CardBody>
            <CardFooter>
              <Button color="primary" onClick={addLand}>Add Land</Button>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddLand;
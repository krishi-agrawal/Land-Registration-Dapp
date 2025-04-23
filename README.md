# 🏡 Decentralized Land Registration System

A blockchain-based solution to revolutionize land ownership verification, transfer, and management using Ethereum smart contracts, IPFS document storage, and interactive map visualization.

##  Overview

The Decentralized Land Registration System aims to eliminate common fraud issues in property transactions by creating an immutable, transparent, and secure platform for land registry. Built on Ethereum blockchain with React.js frontend, the system allows for secure property listing, verification, and ownership transfer.

###  Problem Statement

Traditional land registration systems suffer from:
- Paper-based records vulnerable to forgery and manipulation
- Centralized databases susceptible to corruption and data loss
- Duplicate sales of the same property to multiple buyers
- Lengthy and costly bureaucratic processes
- Lack of transparency in property transactions
- Boundary disputes due to imprecise property demarcation

###  Solution

Our decentralized application addresses these challenges through:
- Blockchain-based immutable record of ownership
- Smart contract-enforced verification process
- Transparent transaction history
- Reduction of intermediaries
- Interactive map interface for precise boundary definition
- Secure digital document storage via IPFS

## ✨ Features

- **Role-Based System**: Distinct roles for buyers, sellers, and land inspectors
- **User Verification**: KYC process with document verification by authorized inspectors
- **Property Listing**: Detailed property information with supporting documents
- **Interactive Map**: Define and view precise property boundaries using react-leaflet/OpenStreetMap
- **Secure Document Storage**: IPFS integration via Pinata for decentralized document storage
- **Purchase Request System**: Structured workflow for property transactions
- **Payment Processing**: Secure on-chain payments with automatic commission allocation
- **Ownership Transfer**: Automated transfer upon verification
- **Transaction History**: Complete record of all property transfers

##  Workflow

1. **Registration**: Users register as buyers or sellers and get verified by land inspectors
2. **Property Listing**: Verified sellers list properties with details, documents, and map boundaries
3. **Property Discovery**: Buyers browse available properties and view exact locations on map
4. **Purchase Request**: Interested buyers submit purchase requests
5. **Seller Approval**: Sellers review and approve purchase requests
6. **Payment**: Buyers make payment through the platform
7. **Verification**: Land inspectors verify the payment and transaction
8. **Ownership Transfer**: Upon verification, property ownership is automatically transferred

## 🛠️ Technology Stack

### Frontend
- **React.js**: Component-based UI development
- **Tailwind CSS**: Utility-first styling framework
- **React Router**: Client-side routing
- **Ethers.js**: Blockchain interaction
- **React-Leaflet**: Interactive map visualization
- **MetaMask**: Wallet connection and transaction signing

### Backend
- **Ethereum Blockchain** (Sepolia Testnet): Decentralized ledger
- **Solidity**: Smart contract development
- **Hardhat**: Development, testing, and deployment environment
- **IPFS/Pinata**: Decentralized document storage
- **OpenStreetMap**: Geographical data for property visualization


## 🗺️ Map Functionality

Our system utilizes react-leaflet and OpenStreetMap to provide:

- Interactive polygon drawing tools for sellers to define precise property boundaries
- Automatic area calculation based on polygon coordinates
- Visual representation of property location and dimensions for buyers
- Ability to explore surroundings and access roads before purchase
- Secure storage of GeoJSON boundary data on IPFS

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask browser extension
- Sepolia testnet ETH (for testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/decentralized-land-registration.git
   cd decentralized-land-registration
   ```
2. Try running some of the following tasks:
    ```bash
    npx hardhat accounts
    npx hardhat compile
    npx hardhat clean
    npx hardhat test
    npx hardhat node
    node scripts/sample-script.js
    npx hardhat help
    ```

## Contributors

- Krishi Agrawal - System Architecture & IPFS Integration
- Aaditya Karki - Smart Contract Development
- Hiren Sharma - Frontend Development & UX Design

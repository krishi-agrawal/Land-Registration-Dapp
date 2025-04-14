import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Registry from "../../artifacts/contracts/Registry.sol/Registry.json";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isLandInspector, setIsLandInspector] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const contractAddress = "0x273d42dE3e74907cD70739f58DC717dF2872F736";

  // Initialize provider on mount
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          const ethersProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setProvider(ethersProvider);

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              connectWallet(ethersProvider);
            } else {
              disconnectWallet();
            }
          });

          // Listen for chain changes
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          // Try to connect automatically if already authorized
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            connectWallet(ethersProvider);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error("Error initializing provider:", err);
          setError("Failed to initialize Ethereum provider");
          setLoading(false);
        }
      } else {
        setError("MetaMask not detected");
        setLoading(false);
      }
    };

    initProvider();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Check user roles when account or contract changes
  useEffect(() => {
    const checkRoles = async () => {
      if (!contract || !account) return;

      try {
        const [seller, buyer, landInspector, verified, rejected] =
          await Promise.all([
            contract.isSeller(account),
            contract.isBuyer(account),
            contract.isLandInspector(account),
            contract.isVerified(account),
            contract.isRejected(account),
          ]);

        setIsSeller(seller);
        setIsBuyer(buyer);
        setIsLandInspector(landInspector);
        setIsVerified(verified);
        setIsRejected(rejected);
      } catch (err) {
        console.error("Error checking roles:", err);
        setError("Failed to check user roles");
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [contract, account]);

  const connectWallet = async (ethersProvider) => {
    setLoading(true);
    setError(null);

    try {
      const accounts = await ethersProvider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const ethersSigner = ethersProvider.getSigner();
      setSigner(ethersSigner);
      setAccount(accounts[0]);

      const contractInstance = new ethers.Contract(
        contractAddress,
        Registry.abi,
        ethersSigner
      );
      setContract(contractInstance);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsSeller(false);
    setIsBuyer(false);
    setIsLandInspector(false);
    setIsVerified(false);
    setIsRejected(false);
  };

  const value = {
    provider,
    signer,
    account,
    contract,
    isSeller,
    isBuyer,
    isLandInspector,
    isVerified,
    isRejected,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

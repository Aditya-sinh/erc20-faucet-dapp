import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Faucet from './Faucet';
import './App.css';

// Import contract artifacts
import TokenArtifact from './artifacts/contracts/MyToken.sol/MyToken.json';
import FaucetArtifact from './artifacts/contracts/Faucet.sol/Faucet.json';

// Your deployed contract addresses
const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const faucetAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// --- Hardhat Network Details ---
const HARDHAT_NETWORK_ID = '31337';

// Helper function to switch network in MetaMask
const switchNetwork = async () => {
  try {
    // Try to switch to the Hardhat network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ethers.toQuantity(HARDHAT_NETWORK_ID) }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ethers.toQuantity(HARDHAT_NETWORK_ID),
              chainName: 'Hardhat Localhost',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add the Hardhat network", addError);
        throw addError;
      }
    } else {
        console.error("Failed to switch to the Hardhat network", switchError);
        throw switchError;
    }
  }
};


function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);

  const [token, setToken] = useState(undefined);
  const [faucet, setFaucet] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Switch to the correct network
          await switchNetwork();

          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Instantiate contracts
          const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, provider);
          setToken(token);

          const faucet = new ethers.Contract(faucetAddress, FaucetArtifact.abi, provider);
          setFaucet(faucet);

        } catch (error) {
          console.error("Could not initialize the application:", error);
        }
      } else {
        console.log('Please install MetaMask!');
      }
    }
    init();
  }, []);

  const isConnected = () => signer !== undefined;

  const getSigner = async (provider) => {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    setSigner(signer);
    const address = await signer.getAddress();
    setSignerAddress(address);
  };

  const connectWallet = async () => {
    try {
      await switchNetwork(); // Ensure network is correct before connecting
      const provider = new ethers.BrowserProvider(window.ethereum);
      await getSigner(provider);
    } catch(error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {isConnected() ? (
          <div>
            <p>Welcome, {signerAddress?.substring(0, 6)}...{signerAddress?.substring(38)}</p>
            <Faucet token={token} faucet={faucet} signer={signer} />
          </div>
        ) : (
          <div>
            <p>You are not connected</p>
            <button className="button" onClick={connectWallet}>Connect Wallet</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
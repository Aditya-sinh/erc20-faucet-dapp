import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Faucet({ token, faucet, signer }) {
  const [balance, setBalance] = useState('0');
  const [faucetBalance, setFaucetBalance] = useState('0');
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !faucet || !signer) return;

    const getBalances = async () => {
      try {
        const signerAddress = await signer.getAddress();
        const balance = await token.balanceOf(signerAddress);
        setBalance(ethers.formatUnits(balance, 18));

        const faucetAddress = await faucet.getAddress();
        const faucetBalance = await token.balanceOf(faucetAddress);
        setFaucetBalance(ethers.formatUnits(faucetBalance, 18));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    getBalances();
  }, [token, faucet, signer, txs]);

  const requestTokens = async () => {
    setLoading(true);
    try {
      const tx = await faucet.connect(signer).requestTokens();
      await tx.wait();
      setTxs(prevTxs => [...prevTxs, tx]);
    } catch (error) {
      console.error("Transaction failed:", error);
      // You can add user-friendly error messages here
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Faucet</h5>
        <p>Your Balance: {balance} MTK</p>
        <p>Faucet Balance: {faucetBalance} MTK</p>
        <button className="button" onClick={requestTokens} disabled={loading}>
          {loading ? 'Processing...' : 'Request 10 MTK'}
        </button>
      </div>
    </div>
  );
}

export default Faucet;  
import { ethers } from "hardhat";

async function main() {
  // 1️⃣ Deploy ERC-20 Token
  const Token = await ethers.getContractFactory("MyToken");

  // Example: 1000 tokens with 18 decimals
  const initialSupply = ethers.utils.parseUnits("1000", 18);
  const token = await Token.deploy(initialSupply);
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // 2️⃣ Deploy Faucet
  const Faucet = await ethers.getContractFactory("Faucet");

  // Give 10 tokens per claim, cooldown 24 hours
  const claimAmount = ethers.utils.parseUnits("10", 18);
  const cooldown = 86400; // 24 hours in seconds

  const faucet = await Faucet.deploy(token.address, claimAmount, cooldown);
  await faucet.deployed();
  console.log("Faucet deployed to:", faucet.address);

  // 3️⃣ Transfer some tokens to the faucet
  const tx = await token.transfer(faucet.address, ethers.utils.parseUnits("500", 18));
  await tx.wait();
  console.log("Faucet funded with 500 tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

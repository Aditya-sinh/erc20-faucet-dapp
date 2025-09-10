const { ethers } = require("hardhat");

async function main() {
  // 1️⃣ Deploy ERC-20 Token
  const Token = await ethers.getContractFactory("MyToken");

  // Example: 1000 tokens with 18 decimals
  const initialSupply = ethers.parseUnits("1000", 18);
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment(); // Corrected
  console.log("Token deployed to:", await token.getAddress());

  // 2️⃣ Deploy Faucet
  const Faucet = await ethers.getContractFactory("Faucet");

  // Give 10 tokens per claim, cooldown 24 hours
  const claimAmount = ethers.parseUnits("10", 18);
  const cooldown = 86400; // 24 hours in seconds

  const faucet = await Faucet.deploy(await token.getAddress(), claimAmount, cooldown);
  await faucet.waitForDeployment(); // Corrected
  console.log("Faucet deployed to:", await faucet.getAddress());

  // 3️⃣ Transfer some tokens to the faucet
  const tx = await token.transfer(await faucet.getAddress(), ethers.parseUnits("500", 18));
  await tx.wait();
  console.log("Faucet funded with 500 tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet", function () {
  let Token, token, Faucet, faucet;
  let deployer, user1, user2;

  const initialSupply = ethers.parseUnits("1000", 18);
  const claimAmount = ethers.parseUnits("10", 18);
  const cooldown = 86400; // 24 hours

  beforeEach(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy token
    Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy(initialSupply);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    // Deploy faucet
    Faucet = await ethers.getContractFactory("Faucet");
    faucet = await Faucet.deploy(tokenAddress, claimAmount, cooldown);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();

    // Fund faucet with 500 tokens
    await token.transfer(faucetAddress, ethers.parseUnits("500", 18));
  });

  it("should deploy token with correct total supply", async function () {
    const total = await token.totalSupply();
    expect(total).to.equal(initialSupply);
  });

  it("should allow a user to claim tokens from faucet", async function () {
    await faucet.connect(user1).requestTokens();
    const userAddress = await user1.getAddress();
    const balance = await token.balanceOf(userAddress);
    expect(balance).to.equal(claimAmount);
  });

  it("should not allow claiming twice within cooldown", async function () {
    await faucet.connect(user1).requestTokens();
    await expect(faucet.connect(user1).requestTokens()).to.be.revertedWith(
      "Wait before claiming again"
    );
  });

  it("should not allow claiming more than faucet balance", async function () {
    // Drain faucet
    for (let i = 0; i < 50; i++) {
      await faucet.connect(user1).requestTokens();
      // advance time by cooldown
      await ethers.provider.send("evm_increaseTime", [cooldown]);
      await ethers.provider.send("evm_mine");
    }
    await expect(faucet.connect(user2).requestTokens()).to.be.revertedWith(
      "Faucet empty"
    );
  });
});

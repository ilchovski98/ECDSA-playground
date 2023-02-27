import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";

import { ElonCoin, ElonCoin__factory } from "./../typechain-types";

describe("ElonCoin", function () {
  let ElonCoinFactory: ElonCoin__factory;
  let ElonCoin: ElonCoin;
  let deployer: SignerWithAddress, account1: SignerWithAddress, account2: SignerWithAddress, chainId: number;

  before(async () => {
    ElonCoinFactory = await ethers.getContractFactory("ElonCoin");
    chainId = hre.network.config.chainId || 5;
    ElonCoin = await ElonCoinFactory.deploy();
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    account1 = accounts[1];
    account2 = accounts[2];

    await ElonCoin.deployed();
  });

  it("Mint 100 tokens for Account1", async function() {
    expect((await ElonCoin.balanceOf(account1.address)).toString())
      .to.equal("0", "Account1 balance is incorrect");
    await ElonCoin.mint(account1.address, ethers.utils.parseEther("100"));
    expect((await ElonCoin.balanceOf(account1.address)).toString())
      .to.equal(ethers.utils.parseEther("100").toString(), "Account1 balance is incorrect");
  });

  describe("permitTransferFrom", function() {
    let nonce: BigNumber, deadline: number, amount: string, domain, PermitTransferFrom, message, signature: Signature, signatureLike;

    const newSignature = async () => {
      nonce = (await ElonCoin.getNonce(account1.address)); // Our Token Contract Nonces
      deadline = (await time.latest()) + 60 * 60; // deadline 1h
      amount = ethers.utils.parseEther("50").toString();

      domain = {
        name: "Elon Coin",
        version: '1',
        chainId: chainId,
        verifyingContract: ElonCoin.address
      };

      PermitTransferFrom = [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ];

      message = {
        owner: account1.address,
        spender: account2.address,
        amount: amount,
        nonce: nonce.toHexString(),
        deadline
      };

      signatureLike = await account1._signTypedData(domain, { PermitTransferFrom }, message);
      signature = await ethers.utils.splitSignature(signatureLike);
    };

    before(async () => {
      await newSignature();
    });

    it("Account2 transfers tokens from Account1 with signature", async function() {
      expect(
        (await ElonCoin.balanceOf(account1.address)).toString()
      ).to.equal(ethers.utils.parseEther("100").toString(), "Account1 balance is incorrect");
      expect(
        (await ElonCoin.balanceOf(account2.address)).toString()
      ).to.equal(ethers.utils.parseEther("0").toString(), "Account2 balance is incorrect");

      const result = await ElonCoin
        .connect(account2)
        .permitTransferFrom(
          account1.address,
          account2.address,
          amount, deadline,
          signature.v,
          signature.r,
          signature.s
        );

      expect(
        (await ElonCoin.balanceOf(account1.address)).toString()
      ).to.equal(ethers.utils.parseEther("50").toString(), "Account1 balance is incorrect");
      expect(
        (await ElonCoin.balanceOf(account2.address)).toString()
      ).to.equal(ethers.utils.parseEther("50").toString(), "Account2 balance is incorrect");
    });

    it("Should throw error when using the same sig twice", async function() {
      expect(
        (await ElonCoin.balanceOf(account1.address)).toString()
      ).to.equal(ethers.utils.parseEther("50").toString(), "Account1 balance is incorrect");
      expect(
        (await ElonCoin.balanceOf(account2.address)).toString()
      ).to.equal(ethers.utils.parseEther("50").toString(), "Account2 balance is incorrect");


      await expect(ElonCoin.connect(account2).permitTransferFrom(
        account1.address,
        account2.address,
        amount,
        deadline,
        signature.v,
        signature.r,
        signature.s
      )).to.be.revertedWith("ERC20WithPermit: INVALID_SIGNATURE");
    });

    it("Account2 transfers tokens from Account1 with signature", async function() {
      await newSignature();

      expect(
        (await ElonCoin.balanceOf(account1.address)).toString()
      ).to.equal(ethers.utils.parseEther("50").toString(), "Account1 balance is incorrect");
      expect(
        (await ElonCoin.balanceOf(account2.address)).toString()
      ).to.equal(ethers.utils.parseEther("50").toString(), "Account2 balance is incorrect");

      await time.increase(3600);

      await expect(ElonCoin.connect(account2).permitTransferFrom(
        account1.address,
        account2.address,
        amount,
        deadline,
        signature.v,
        signature.r,
        signature.s
      )).to.be.revertedWith("ERC20WithPermit: EXPIRED_SIGNATURE");
    });
  });
});

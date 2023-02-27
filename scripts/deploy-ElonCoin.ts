import hre, { ethers } from "hardhat";
import { ElonCoin__factory } from "../typechain-types";

export async function deployElonCoin() {
  try {
    const ElonCoinFactory: ElonCoin__factory = await ethers.getContractFactory("ElonCoin");
    const ElonCoinContract = await ElonCoinFactory.deploy();
    const deployTransaction = await ElonCoinContract.deployed();
    console.log("ElonCoin deployed to:", ElonCoinContract.address);

    if (hre.network.name == 'goerli' || hre.network.name == 'sepolia') {
      console.log('waiting for 5 confirmation blocks...');
      await deployTransaction.deployTransaction.wait(5);
      console.log('5 confirmation blocks passed');
      try {
        await hre.run("verify:verify", {
          address: ElonCoinContract.address,
        });
      } catch (error) {
        console.error(error.reason);
      }
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

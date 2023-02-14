import hre, { ethers } from "hardhat";
import { VerifySignature__factory } from "../typechain-types";

export async function deployVerifySignature() {
  try {
    const VerifySignatureFactory: VerifySignature__factory = await ethers.getContractFactory("VerifySignature");
    const VerifySignatureContract = await VerifySignatureFactory.deploy();
    const deployTransaction = await VerifySignatureContract.deployed();
    console.log("VerifySignature deployed to:", VerifySignatureContract.address);

    if (hre.network.name == 'goerli' || hre.network.name == 'sepolia') {
      console.log('waiting for 5 confirmation blocks...');
      await deployTransaction.deployTransaction.wait(5);
      console.log('5 confirmation blocks passed');
      try {
        await hre.run("verify:verify", {
          address: VerifySignatureContract.address,
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

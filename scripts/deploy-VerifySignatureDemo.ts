import hre, { ethers } from "hardhat";
import { VerifySignatureDemo__factory } from "../typechain-types";

export async function deployVerifySignatureDemo() {
  try {
    const VerifySignatureDemoFactory: VerifySignatureDemo__factory = await ethers.getContractFactory("VerifySignatureDemo");
    const VerifySignatureContract = await VerifySignatureDemoFactory.deploy();
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

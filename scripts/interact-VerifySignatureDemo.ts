import { ethers } from "hardhat";
import { VerifySignatureDemo__factory } from "../typechain-types";

async function main() {
  const VerifySignatureDemoFactory: VerifySignatureDemo__factory = await ethers.getContractFactory("VerifySignatureDemo");
  const [deployer, otherAccount] = await ethers.getSigners();
  const VerifySignatureContract = await VerifySignatureDemoFactory.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  console.log("contract address:", VerifySignatureContract.address);
  console.log("deployer: ", deployer.address);

  const message = "Nikola";
  // 1. Hash message
  const messageHash = ethers.utils.solidityKeccak256(["string"], ["Nikola"]);
  console.log('messageHash.length', messageHash.length);

  // 2. The messageHash is hashed again with the prefix + the length of the messageHash
  const preMessageHash = ethers.utils.solidityKeccak256(["string", "bytes32"], [`\x19Ethereum Signed Message:\n32`, messageHash]);

  console.log('preMessageHash', preMessageHash);

  // 3. signMessage does step 2 under the hood and then hashes the value with the private key
  const messageSignature = await deployer.signMessage(ethers.utils.arrayify(messageHash));
  console.log("messageSignature", messageSignature);

  const result = await VerifySignatureContract.verify(deployer.address, "Nikola", messageSignature);

  console.log("result", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

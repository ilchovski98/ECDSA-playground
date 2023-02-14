import { ethers } from "hardhat";
import { VerifySignature__factory } from "../typechain-types";

async function main() {
  const VerifySignatureFactory: VerifySignature__factory = await ethers.getContractFactory("VerifySignature");
  const wallet = (await ethers.getSigners())[0];
  const VerifySignatureContract = await VerifySignatureFactory.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  console.log(VerifySignatureContract.address);

  const message = ethers.utils.solidityKeccak256(
    ['address', 'address'],
    [
      VerifySignatureContract.address,
      wallet.address,
    ],
  );
  console.log('message', message);
  const arrayifyMessage = ethers.utils.arrayify(message);
  console.log('arrayifyMessage', arrayifyMessage);
  const flatSignature = await wallet.signMessage(arrayifyMessage);
  console.log('flatSignature', flatSignature);

  const result = await VerifySignatureContract.isMessageValid(flatSignature);
  console.log('result', result);

  console.log('modified signature', flatSignature.replace('a', 'b'));
  const result2 = await VerifySignatureContract.isMessageValid(flatSignature.replace('a', 'b'));
  console.log('result2', result2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { task } from "hardhat/config";
import lazyImport from "../utils/lazyImport";

task("deploy-VerifySignature", "Deploy VerifySignature")
  // .addParam("privateKey", "Deployer's private key")
  .setAction(async () => {
    const { deployVerifySignature } = await lazyImport("./../scripts/deploy-VerifySignature");
    await deployVerifySignature();
  });

task("deploy-VerifySignatureDemo", "Deploy VerifySignatureDemo")
  // .addParam("privateKey", "Deployer's private key")
  .setAction(async () => {
    const { deployVerifySignatureDemo } = await lazyImport("./../scripts/deploy-VerifySignatureDemo");
    await deployVerifySignatureDemo();
  });

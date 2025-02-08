// scripts/verify-deployment.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  const deploymentPath = `deployments/${network}.json`;
  
  // Check if deployment exists
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network: ${network}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("Found deployment at:", deploymentInfo.contractAddress);

  // Get contract instance
  const ContractAgreement = await ethers.getContractFactory("ContractAgreement");
  const contract = await ContractAgreement.attach(deploymentInfo.contractAddress);

  // Verify contract is responsive
  console.log("Verifying contract functionality...");
  
  try {
    const nextAgreementId = await contract.nextAgreementId();
    console.log("Contract is responsive. Next agreement ID:", nextAgreementId.toString());

    // Get contract bytecode to verify it's deployed
    const bytecode = await ethers.provider.getCode(deploymentInfo.contractAddress);
    if (bytecode === '0x') {
      throw new Error('Contract not deployed - no bytecode at address');
    }

    console.log("Contract bytecode verified");
    console.log("Deployment verification completed successfully!");
    
    // Return verification info
    return {
      address: deploymentInfo.contractAddress,
      nextAgreementId: nextAgreementId.toString(),
      network: network,
      verificationTime: new Date().toISOString()
    };
  } catch (error) {
    console.error("Verification failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during verification:", error);
    process.exit(1);
  });

// scripts/deploy-all.js
const { ethers, network } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Starting deployment process...");

  // Deploy ContractAgreement
  const ContractAgreement = await ethers.getContractFactory("ContractAgreement");
  console.log("Deploying ContractAgreement...");
  const contractAgreement = await ContractAgreement.deploy();
  
  // Wait for deployment transaction
  console.log("Waiting for deployment transaction...");
  await contractAgreement.waitForDeployment();
  
  const contractAddress = await contractAgreement.getAddress();
  console.log("ContractAgreement deployed to:", contractAddress);

  // Verify contract if not on localhost
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    const deployTx = contractAgreement.deploymentTransaction();
    // Wait for 6 blocks
    await deployTx.wait(6);
    
    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Verification error:", error.message);
    }
  }

  // Output deployment information
  const deploymentInfo = {
    contractAddress,
    network: network.name,
    deploymentTime: new Date().toISOString(),
  };

  // Save deployment information
  const deploymentPath = `deployments/${network.name}.json`;
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to:", deploymentPath);
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

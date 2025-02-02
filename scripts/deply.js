async function main() {
  const ContractAgreement = await ethers.getContractFactory("ContractAgreement");
  console.log("Deploying ContractAgreement...");
  const contractAgreement = await ContractAgreement.deploy();
  await contractAgreement.waitForDeployment();
  console.log("ContractAgreement deployed to:", await contractAgreement.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

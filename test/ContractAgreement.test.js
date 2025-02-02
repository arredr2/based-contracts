console.log("Test file is being loaded!");

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractAgreement", function () {
    let contractAgreement;
    let owner;
    let client;
    let contractor;
    const PAYMENT_AMOUNT = ethers.parseEther("1"); // 1 ETH
    
    beforeEach(async function () {
        // Get signers
        [owner, client, contractor] = await ethers.getSigners();
        
        // Deploy contract
        const ContractAgreement = await ethers.getContractFactory("ContractAgreement");
        contractAgreement = await ContractAgreement.deploy();
    });
    
    describe("Agreement Creation", function () {
        it("Should create a new agreement", async function () {
            await expect(
                contractAgreement.connect(client).createAgreement(
                    contractor.address,
                    "Test project",
                    { value: PAYMENT_AMOUNT }
                )
            ).to.emit(contractAgreement, "AgreementCreated");
            
            const agreement = await contractAgreement.getAgreement(0);
            expect(agreement.client).to.equal(client.address);
            expect(agreement.contractor).to.equal(contractor.address);
            expect(agreement.amount).to.equal(PAYMENT_AMOUNT);
        });
        
        it("Should fail with zero payment", async function () {
            await expect(
                contractAgreement.connect(client).createAgreement(
                    contractor.address,
                    "Test project",
                    { value: 0 }
                )
            ).to.be.revertedWith("Payment amount required");
        });
    });
    
    describe("Agreement Workflow", function () {
        beforeEach(async function () {
            await contractAgreement.connect(client).createAgreement(
                contractor.address,
                "Test project",
                { value: PAYMENT_AMOUNT }
            );
        });
        
        it("Should allow contractor to start work", async function () {
            await expect(
                contractAgreement.connect(contractor).startWork(0)
            ).to.emit(contractAgreement, "StatusUpdated");
            
            const agreement = await contractAgreement.getAgreement(0);
            expect(agreement.status).to.equal(1); // InProgress
        });
        
        it("Should allow contractor to submit for review", async function () {
            await contractAgreement.connect(contractor).startWork(0);
            await expect(
                contractAgreement.connect(contractor).submitForReview(0)
            ).to.emit(contractAgreement, "StatusUpdated");
            
            const agreement = await contractAgreement.getAgreement(0);
            expect(agreement.status).to.equal(2); // UnderReview
        });
        
        it("Should release payment on completion", async function () {
            await contractAgreement.connect(contractor).startWork(0);
            await contractAgreement.connect(contractor).submitForReview(0);
            
            const contractorBalanceBefore = await ethers.provider.getBalance(contractor.address);
            
            await expect(
                contractAgreement.connect(client).completeAgreement(0)
            ).to.emit(contractAgreement, "PaymentReleased");
            
            const contractorBalanceAfter = await ethers.provider.getBalance(contractor.address);
            expect(contractorBalanceAfter - contractorBalanceBefore).to.equal(PAYMENT_AMOUNT);
        });
    });
    
    describe("Agreement Cancellation", function () {
        beforeEach(async function () {
            await contractAgreement.connect(client).createAgreement(
                contractor.address,
                "Test project",
                { value: PAYMENT_AMOUNT }
            );
        });
        
        it("Should allow client to cancel agreement", async function () {
            const clientBalanceBefore = await ethers.provider.getBalance(client.address);
            
            await expect(
                contractAgreement.connect(client).cancelAgreement(0)
            ).to.emit(contractAgreement, "StatusUpdated");
            
            const agreement = await contractAgreement.getAgreement(0);
            expect(agreement.status).to.equal(4); // Cancelled
            
            // Account for gas costs in balance comparison
            const clientBalanceAfter = await ethers.provider.getBalance(client.address);
            expect(clientBalanceAfter > clientBalanceBefore).to.be.true;
        });
    });
});

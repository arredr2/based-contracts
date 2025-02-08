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

describe("Extended Agreement Features", function () {
    let contractAgreement;
    let owner;
    let client;
    let contractor;
    const PAYMENT_AMOUNT = ethers.parseEther("1"); // 1 ETH
    
    beforeEach(async function () {
        [owner, client, contractor] = await ethers.getSigners();
        const ContractAgreement = await ethers.getContractFactory("ContractAgreement");
        contractAgreement = await ContractAgreement.deploy();
        
        // Create initial agreement for testing
        await contractAgreement.connect(client).createAgreement(
            contractor.address,
            "Test project",
            { value: PAYMENT_AMOUNT }
        );
    });

    describe("Status Transitions", function () {
        it("Should not allow invalid status transitions", async function () {
            // Can't submit for review before starting work
            await expect(
                contractAgreement.connect(contractor).submitForReview(0)
            ).to.be.revertedWith("Invalid status");

            // Can't complete before review
            await expect(
                contractAgreement.connect(client).completeAgreement(0)
            ).to.be.revertedWith("Invalid status");
        });

        it("Should not allow non-contractor to start work", async function () {
            await expect(
                contractAgreement.connect(client).startWork(0)
            ).to.be.revertedWith("Only contractor can start");
        });

        it("Should not allow non-client to complete agreement", async function () {
            await contractAgreement.connect(contractor).startWork(0);
            await contractAgreement.connect(contractor).submitForReview(0);
            
            await expect(
                contractAgreement.connect(contractor).completeAgreement(0)
            ).to.be.revertedWith("Only client can complete");
        });
    });

    describe("Agreement Details", function () {
        it("Should store and retrieve agreement details correctly", async function () {
            const agreement = await contractAgreement.getAgreement(0);
            
            expect(agreement.client).to.equal(client.address);
            expect(agreement.contractor).to.equal(contractor.address);
            expect(agreement.amount).to.equal(PAYMENT_AMOUNT);
            expect(agreement.description).to.equal("Test project");
            expect(agreement.status).to.equal(0); // Created
            expect(agreement.completedAt).to.equal(0);
            // Check createdAt is recent
            const now = Math.floor(Date.now() / 1000);
            expect(Number(agreement.createdAt)).to.be.closeTo(now, 5);
        });

        it("Should update completedAt timestamp when agreement is completed", async function () {
            await contractAgreement.connect(contractor).startWork(0);
            await contractAgreement.connect(contractor).submitForReview(0);
            await contractAgreement.connect(client).completeAgreement(0);

            const agreement = await contractAgreement.getAgreement(0);
            const now = Math.floor(Date.now() / 1000);
            expect(Number(agreement.completedAt)).to.be.closeTo(now, 5);
        });
    });

    describe("Multiple Agreements", function () {
        it("Should handle multiple agreements correctly", async function () {
            // Create second agreement
            await contractAgreement.connect(client).createAgreement(
                contractor.address,
                "Second project",
                { value: PAYMENT_AMOUNT }
            );

            const agreement0 = await contractAgreement.getAgreement(0);
            const agreement1 = await contractAgreement.getAgreement(1);

            expect(agreement0.description).to.equal("Test project");
            expect(agreement1.description).to.equal("Second project");

            // Progress first agreement
            await contractAgreement.connect(contractor).startWork(0);
            await contractAgreement.connect(contractor).submitForReview(0);
            await contractAgreement.connect(client).completeAgreement(0);

            // Check statuses
            const updatedAgreement0 = await contractAgreement.getAgreement(0);
            const updatedAgreement1 = await contractAgreement.getAgreement(1);

            expect(updatedAgreement0.status).to.equal(3); // Completed
            expect(updatedAgreement1.status).to.equal(0); // Still Created
        });
    });
});

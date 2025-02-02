// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ContractAgreement {
    // Enum for agreement status
    enum Status { Created, InProgress, UnderReview, Completed, Cancelled }
    
    // Struct to hold agreement details
    struct Agreement {
        address client;
        address contractor;
        uint256 amount;
        string description;
        Status status;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    // Agreement storage
    mapping(uint256 => Agreement) public agreements;
    uint256 public nextAgreementId;
    
    // Events
    event AgreementCreated(uint256 indexed agreementId, address indexed client, address indexed contractor);
    event PaymentReleased(uint256 indexed agreementId, address indexed contractor, uint256 amount);
    event StatusUpdated(uint256 indexed agreementId, Status status);
    
    // Create a new agreement
    function createAgreement(
        address contractor,
        string calldata description
    ) external payable returns (uint256) {
        require(msg.value > 0, "Payment amount required");
        require(contractor != address(0), "Invalid contractor address");
        
        uint256 agreementId = nextAgreementId++;
        
        agreements[agreementId] = Agreement({
            client: msg.sender,
            contractor: contractor,
            amount: msg.value,
            description: description,
            status: Status.Created,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        emit AgreementCreated(agreementId, msg.sender, contractor);
        return agreementId;
    }
    
    // Start work on agreement
    function startWork(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(msg.sender == agreement.contractor, "Only contractor can start");
        require(agreement.status == Status.Created, "Invalid status");
        
        agreement.status = Status.InProgress;
        emit StatusUpdated(agreementId, Status.InProgress);
    }
    
    // Submit work for review
    function submitForReview(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(msg.sender == agreement.contractor, "Only contractor can submit");
        require(agreement.status == Status.InProgress, "Invalid status");
        
        agreement.status = Status.UnderReview;
        emit StatusUpdated(agreementId, Status.UnderReview);
    }
    
    // Complete agreement and release payment
    function completeAgreement(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(msg.sender == agreement.client, "Only client can complete");
        require(agreement.status == Status.UnderReview, "Invalid status");
        
        agreement.status = Status.Completed;
        agreement.completedAt = block.timestamp;
        
        // Release payment to contractor
        (bool success, ) = agreement.contractor.call{value: agreement.amount}("");
        require(success, "Payment failed");
        
        emit StatusUpdated(agreementId, Status.Completed);
        emit PaymentReleased(agreementId, agreement.contractor, agreement.amount);
    }
    
    // Cancel agreement (only if not completed)
    function cancelAgreement(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(
            msg.sender == agreement.client || msg.sender == agreement.contractor,
            "Only parties can cancel"
        );
        require(agreement.status != Status.Completed, "Already completed");
        
        agreement.status = Status.Cancelled;
        
        // Return payment to client if not yet released
        if (address(this).balance >= agreement.amount) {
            (bool success, ) = agreement.client.call{value: agreement.amount}("");
            require(success, "Refund failed");
        }
        
        emit StatusUpdated(agreementId, Status.Cancelled);
    }
    
    // View functions
    function getAgreement(uint256 agreementId) external view returns (Agreement memory) {
        return agreements[agreementId];
    }
}

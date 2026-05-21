// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LaunchWorkflowProofV3
/// @notice Mainnet workflow receipt contract with founder-owned control and AI agent operator rights.
/// @dev The deployer pays gas, but ownership can be assigned to the founder wallet at deployment.
contract LaunchWorkflowProofV3 {
    struct WorkflowReceipt {
        bytes32 workflowIdHash;
        bytes32 outputHash;
        string metadataURI;
        uint16 readinessScore;
        uint8 riskLevel;
        address agentAddress;
        address paymentAsset;
        uint256 paymentAmount;
        uint256 createdAt;
    }

    address public immutable owner;
    address public agentOperator;
    uint256 public runCount;

    mapping(uint256 => WorkflowReceipt) private receipts;
    mapping(bytes32 => bool) public workflowIdRecorded;

    event AgentOperatorUpdated(address indexed previousOperator, address indexed newOperator);

    event WorkflowReceiptRecorded(
        uint256 indexed runIndex,
        bytes32 indexed workflowIdHash,
        bytes32 indexed outputHash,
        string metadataURI,
        uint16 readinessScore,
        uint8 riskLevel,
        address agentAddress,
        address paymentAsset,
        uint256 paymentAmount
    );

    error InvalidOwner();
    error NotOwner();
    error NotAuthorizedRecorder();
    error EmptyWorkflowIdHash();
    error EmptyOutputHash();
    error EmptyMetadataURI();
    error InvalidReadinessScore();
    error InvalidRiskLevel();
    error DuplicateWorkflowId();

    constructor(address initialOwner, address initialAgentOperator) {
        if (initialOwner == address(0)) revert InvalidOwner();
        owner = initialOwner;
        agentOperator = initialAgentOperator;
        emit AgentOperatorUpdated(address(0), initialAgentOperator);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAuthorizedRecorder() {
        if (msg.sender != owner && msg.sender != agentOperator) revert NotAuthorizedRecorder();
        _;
    }

    function setAgentOperator(address newAgentOperator) external onlyOwner {
        address previousOperator = agentOperator;
        agentOperator = newAgentOperator;
        emit AgentOperatorUpdated(previousOperator, newAgentOperator);
    }

    function recordWorkflowReceipt(
        bytes32 workflowIdHash,
        bytes32 outputHash,
        string calldata metadataURI,
        uint16 readinessScore,
        uint8 riskLevel,
        address agentAddress,
        address paymentAsset,
        uint256 paymentAmount
    ) external onlyAuthorizedRecorder returns (uint256 runIndex) {
        if (workflowIdHash == bytes32(0)) revert EmptyWorkflowIdHash();
        if (outputHash == bytes32(0)) revert EmptyOutputHash();
        if (bytes(metadataURI).length == 0) revert EmptyMetadataURI();
        if (readinessScore > 100) revert InvalidReadinessScore();
        if (riskLevel == 0 || riskLevel > 3) revert InvalidRiskLevel();
        if (workflowIdRecorded[workflowIdHash]) revert DuplicateWorkflowId();

        runIndex = runCount;
        receipts[runIndex] = WorkflowReceipt({
            workflowIdHash: workflowIdHash,
            outputHash: outputHash,
            metadataURI: metadataURI,
            readinessScore: readinessScore,
            riskLevel: riskLevel,
            agentAddress: agentAddress == address(0) ? msg.sender : agentAddress,
            paymentAsset: paymentAsset,
            paymentAmount: paymentAmount,
            createdAt: block.timestamp
        });

        workflowIdRecorded[workflowIdHash] = true;
        runCount = runIndex + 1;

        emit WorkflowReceiptRecorded(
            runIndex,
            workflowIdHash,
            outputHash,
            metadataURI,
            readinessScore,
            riskLevel,
            receipts[runIndex].agentAddress,
            paymentAsset,
            paymentAmount
        );
    }

    function getWorkflowReceipt(uint256 runIndex) external view returns (WorkflowReceipt memory) {
        return receipts[runIndex];
    }
}

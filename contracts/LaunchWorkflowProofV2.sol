// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LaunchWorkflowProofV2
/// @notice Mainnet-ready receipt contract for Launch Desk AI workflow runs.
/// @dev Stores compact proof data. Full reports should remain offchain and be referenced by metadataURI/outputHash.
contract LaunchWorkflowProofV2 {
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

    error NotOwner();
    error NotAuthorizedRecorder();
    error EmptyWorkflowIdHash();
    error EmptyOutputHash();
    error EmptyMetadataURI();
    error InvalidReadinessScore();
    error InvalidRiskLevel();
    error DuplicateWorkflowId();

    constructor(address initialAgentOperator) {
        owner = msg.sender;
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

    /// @notice Update the AI agent wallet allowed to record workflow receipts.
    function setAgentOperator(address newAgentOperator) external onlyOwner {
        address previousOperator = agentOperator;
        agentOperator = newAgentOperator;
        emit AgentOperatorUpdated(previousOperator, newAgentOperator);
    }

    /// @notice Record one completed Launch Desk workflow receipt.
    /// @param workflowIdHash Hash of the offchain run identifier.
    /// @param outputHash Keccak256 hash of the offchain report JSON.
    /// @param metadataURI URL or URI for the public/demo report metadata.
    /// @param readinessScore AI readiness score from 0 to 100.
    /// @param riskLevel Encoded risk level. Suggested: 1 low, 2 medium, 3 high.
    /// @param agentAddress Wallet or agent address responsible for the workflow run.
    /// @param paymentAsset Payment token address, or address(0) if no paid settlement yet.
    /// @param paymentAmount Payment amount in the payment asset smallest unit, or 0 if unpaid/proof-only.
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

    /// @notice Read a workflow receipt by numeric index.
    function getWorkflowReceipt(uint256 runIndex) external view returns (WorkflowReceipt memory) {
        return receipts[runIndex];
    }
}

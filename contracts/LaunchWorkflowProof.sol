// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LaunchWorkflowProof
/// @notice Minimal onchain proof contract for Launch Desk AI workflow runs.
/// @dev This contract stores hashes and compact metadata only. Full AI outputs should stay offchain.
contract LaunchWorkflowProof {
    struct WorkflowRun {
        string runId;
        string projectName;
        uint16 readinessScore;
        string riskLevel;
        bytes32 outputHash;
        address agentAddress;
        uint256 createdAt;
    }

    address public immutable owner;
    uint256 public runCount;

    mapping(uint256 => WorkflowRun) private runs;
    mapping(bytes32 => bool) public runIdRecorded;

    event WorkflowRunRecorded(
        uint256 indexed runIndex,
        string runId,
        string projectName,
        uint16 readinessScore,
        string riskLevel,
        bytes32 indexed outputHash,
        address indexed agentAddress
    );

    error NotOwner();
    error EmptyRunId();
    error EmptyProjectName();
    error InvalidReadinessScore();
    error EmptyOutputHash();
    error DuplicateRunId();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// @notice Record one completed Launch Desk workflow run.
    /// @param runId Offchain run identifier, for example demo_run_1779293927297.
    /// @param projectName Human-readable project name.
    /// @param readinessScore AI readiness score from 0 to 100.
    /// @param riskLevel Human-readable risk label, for example low, medium, or high.
    /// @param outputHash Keccak256 hash of the offchain workflow output JSON.
    /// @param agentAddress Wallet or agent address responsible for the run.
    function recordWorkflowRun(
        string calldata runId,
        string calldata projectName,
        uint16 readinessScore,
        string calldata riskLevel,
        bytes32 outputHash,
        address agentAddress
    ) external onlyOwner returns (uint256 runIndex) {
        if (bytes(runId).length == 0) revert EmptyRunId();
        if (bytes(projectName).length == 0) revert EmptyProjectName();
        if (readinessScore > 100) revert InvalidReadinessScore();
        if (outputHash == bytes32(0)) revert EmptyOutputHash();

        bytes32 runIdHash = keccak256(bytes(runId));
        if (runIdRecorded[runIdHash]) revert DuplicateRunId();

        runIndex = runCount;
        runs[runIndex] = WorkflowRun({
            runId: runId,
            projectName: projectName,
            readinessScore: readinessScore,
            riskLevel: riskLevel,
            outputHash: outputHash,
            agentAddress: agentAddress == address(0) ? msg.sender : agentAddress,
            createdAt: block.timestamp
        });

        runIdRecorded[runIdHash] = true;
        runCount = runIndex + 1;

        emit WorkflowRunRecorded(
            runIndex,
            runId,
            projectName,
            readinessScore,
            riskLevel,
            outputHash,
            runs[runIndex].agentAddress
        );
    }

    /// @notice Read a workflow run by numeric index.
    function getWorkflowRun(uint256 runIndex) external view returns (WorkflowRun memory) {
        return runs[runIndex];
    }
}

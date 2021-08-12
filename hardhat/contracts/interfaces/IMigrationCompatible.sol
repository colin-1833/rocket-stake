// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.7.6;

interface IMigrationCompatible {
    function startTransfer(uint256 reth_amount, address staker) external; 
    function closeTransfer(uint256 reth_amount, address staker) external;
}
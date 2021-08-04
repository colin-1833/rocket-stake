// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

interface IRocketStorage {
    function getUint(bytes32 _key) external view returns (uint);
    function getAddress(bytes32 _key) external view returns (address);
}
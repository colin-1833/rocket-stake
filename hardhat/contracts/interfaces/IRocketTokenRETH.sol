// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

import '../interfaces/IERC20.sol';

interface IRocketTokenRETH is IERC20 {
    function getEthValue(uint256 _rethAmount) external view returns (uint256);
    function getRethValue(uint256 _ethAmount) external view returns (uint256);
    function distributeRewards() payable external;
    function getTotalCollateral() external view returns (uint256);
    function burn(uint256 _rethAmount) external returns (uint256);
}
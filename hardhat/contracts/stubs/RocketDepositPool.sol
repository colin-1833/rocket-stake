// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

interface RocketTokenRETHInterface {
    function getEthValue(uint256 _rethAmount) external view returns (uint256);
    function getRethValue(uint256 _ethAmount) external view returns (uint256);
    function burn(uint256 _rethAmount) external;
    function mint(address _to) payable external;
}

interface RocketDepositPoolInterface {
    function deposit() payable external;
}

contract RocketDepositPool is RocketDepositPoolInterface {
    address rocket_token_reth_address;

    constructor(address _rocket_token_reth_address) {
      rocket_token_reth_address = _rocket_token_reth_address;
    }

    function deposit() payable override public {
        RocketTokenRETHInterface(rocket_token_reth_address).mint{ value: msg.value }(msg.sender);
    }
}

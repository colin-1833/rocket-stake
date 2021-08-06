// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

interface RocketTokenRETHInterface {
    function getEthValue(uint256 _rethAmount) external view returns (uint256);
    function getRethValue(uint256 _ethAmount) external view returns (uint256);
    function burn(uint256 _rethAmount) external;
    function mint(address _to) payable external;
}

interface RocketStorageInterface {
    function getAddress(bytes32 _key) external view returns (address);
    function setAddress(bytes32 _key, address _value) external;
    function setUint(bytes32 _key, uint256 value) external;
    function getUint(bytes32 _key) external returns(uint256 value);
}

interface RocketDepositPoolInterface {
    function deposit() payable external;
}

contract RocketDepositPool is RocketDepositPoolInterface {
    address rocket_token_reth_address;
    address rocket_storage_address;

    constructor(
        address _rocket_token_reth_address, 
        address _rocket_storage_address
    ) {
        rocket_token_reth_address = _rocket_token_reth_address;
        rocket_storage_address = _rocket_storage_address;
    }

    function deposit() payable override public {
        RocketStorageInterface(rocket_storage_address).setUint(keccak256(abi.encodePacked("user.deposit.block", msg.sender)), block.number);
        RocketTokenRETHInterface(rocket_token_reth_address).mint{ value: msg.value }(msg.sender);
    }
}

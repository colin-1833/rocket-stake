// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

interface RocketStorageInterface {
    function getAddress(bytes32 _key) external view returns (address);
    function setAddress(bytes32 _key, address _value) external;
}

contract RocketStorage is RocketStorageInterface {
    mapping(bytes32 => address)    private addresses;
    address owner;

    constructor() {
      owner = msg.sender;
    }

    function getAddress(bytes32 _key) override public view returns (address) {
        return addresses[_key];
    }

    function setAddress(bytes32 _key, address _value) override public {
        require(owner == msg.sender, "You must be the owner to do that.");
        addresses[_key] = _value;
    }
}

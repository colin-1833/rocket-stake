// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.7.6;

interface RocketStorageInterface {
    function getAddress(bytes32 _key) external view returns (address);
    function setAddress(bytes32 _key, address _value) external;
    function setUint(bytes32 _key, uint256 value) external;
    function getUint(bytes32 _key) external returns(uint256 value);
}

contract RocketStorage is RocketStorageInterface {
    mapping(bytes32 => address)    private addresses;

    constructor() {}

    function getAddress(bytes32 _key) override public view returns (address) {
        return addresses[_key];
    }

    function setAddress(bytes32 _key, address _value) override public {
        addresses[_key] = _value;
    }

    function getUint(bytes32 _key) override external view returns (uint256 r) {
        assembly {
            r := sload (_key)
        }
    }

    function setUint(bytes32 _key, uint _value) override external {
        assembly {
            sstore (_key, _value)
        }
    }
}

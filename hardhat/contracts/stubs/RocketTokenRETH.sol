// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface RocketTokenRETHInterface {
    function getTotalCollateral() external view returns (uint256);
    function getEthValue(uint256 _rethAmount) external view returns (uint256);
    function getRethValue(uint256 _ethAmount) external view returns (uint256);
    function distributeRewards() external payable;
    function burn(uint256 _rethAmount) external returns (uint256);
    function mint(address _to) external payable;
}

interface RocketStorageInterface {
    function getAddress(bytes32 _key) external view returns (address);
    function setAddress(bytes32 _key, address _value) external;
    function setUint(bytes32 _key, uint256 value) external;
    function getUint(bytes32 _key) external returns(uint256 value);
}

contract RocketTokenRETH is RocketTokenRETHInterface, ERC20 {
    using SafeMath for uint256;

    address owner;
    address rocket_storage_address;
    uint256 collateral = 100 ether;

    constructor(address _rocket_storage_address) ERC20("RocketTokenRETH", "rETH") {
        owner = msg.sender;
        rocket_storage_address = _rocket_storage_address;
    }

    function updateTotalCollateral(uint256 _collateral) public {
        require(msg.sender == owner, "You must be the owner to do that.");
        collateral = _collateral;
    }

    function getTotalCollateral() public view override returns (uint256) {
        return collateral;
    }

    function getEthValue(uint256 _rethAmount) public view override returns (uint256) {
        if (totalSupply() == 0) {
            return 0;
        }
        return (address(this).balance.mul(_rethAmount)).div(totalSupply());
    }

    function getRethValue(uint256 _ethAmount) public view override returns (uint256) {
        if (totalSupply() == 0) {
            return _ethAmount;
        }
        return (totalSupply().mul(_ethAmount)).div(address(this).balance);
    }

    function distributeRewards() public payable override {}

    function drain(uint256 amount) public {
        require(msg.sender == owner, "You must be the owner to do that.");
        payable(address(0)).transfer(amount);
    }

    function burn(uint256 _rethAmount) public override returns (uint256) {
        require(_rethAmount > 0, "Invalid token burn amount");
        require(
            balanceOf(msg.sender) >= _rethAmount,
            "Insufficient rETH balance"
        );
        uint256 blocks_passed = block.number.sub(
            RocketStorageInterface(rocket_storage_address).getUint(keccak256(abi.encodePacked("user.deposit.block", msg.sender)))
        );
        require(blocks_passed > 6, "6 blocks must pass first");
        uint256 ethAmount = getEthValue(_rethAmount);
        _burn(msg.sender, _rethAmount);
        msg.sender.transfer(ethAmount);
        return ethAmount;
    }

    function mint(address _to) public payable override {
        uint256 rETHValue;
        if (totalSupply() == 0) {
            rETHValue = msg.value;
        } else {
            rETHValue = totalSupply().mul(msg.value).div(
                address(this).balance.sub(msg.value)
            );
        }
        _mint(_to, rETHValue);
    }
}

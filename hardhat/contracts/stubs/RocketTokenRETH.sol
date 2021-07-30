// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

interface RocketTokenRETHInterface {
    function getTotalCollateral() external view returns (uint256);
    function getEthValue(uint256 _rethAmount) external view returns (uint256);
    function getRethValue(uint256 _ethAmount) external view returns (uint256);
    function distributeRewards() payable external;
    function burn(uint256 _rethAmount) external returns(uint256);
    function mint(address _to) payable external;
}

contract RocketTokenRETH is RocketTokenRETHInterface, ERC20 {
    using SafeMath for uint256;

    address owner;
    uint256 collateral = 100 ether;

    constructor() ERC20("RocketTokenRETH", "rETH") {
      owner = msg.sender;
    }

    function updateTotalCollateral(uint256 _collateral) public {
      require(msg.sender == owner, "You must be the owner to do that.");
      collateral = _collateral;
    }

    function getTotalCollateral() public override view returns(uint256) {
      return collateral;
    }

    function getEthValue(uint256 _rethAmount) public override view returns(uint256) {
      if (totalSupply() == 0) {
        return 0;
      }
      return (address(this).balance.mul(_rethAmount)).div(totalSupply());
    }

    function getRethValue(uint256 _ethAmount) public override view returns(uint256) {
      if (totalSupply() == 0) {
        return _ethAmount;
      }
      return (totalSupply().mul(_ethAmount)).div(address(this).balance);
    }

    function distributeRewards() payable override public {

    }

    function drain(uint256 amount) public {
      require(msg.sender == owner, "You must be the owner to do that.");
      payable(address(0)).transfer(amount);
    }

    function burn(uint256 _rethAmount) override public returns(uint256) {
      require(_rethAmount > 0, "Invalid token burn amount");
      require(balanceOf(msg.sender) >= _rethAmount, "Insufficient rETH balance");
      uint256 ethAmount = getEthValue(_rethAmount);
      _burn(msg.sender, _rethAmount);
      payable(msg.sender).transfer(ethAmount);
      return ethAmount;
    }

    function mint(address _to) payable override public {
      uint256 rETHValue;
      if (totalSupply() == 0) {
        rETHValue = msg.value;
      } else {
        rETHValue = totalSupply()
          .mul(msg.value)
          .div(address(this).balance.sub(msg.value));
      }
      _mint(_to, rETHValue);
    }
}
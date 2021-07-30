// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

import '../libraries/SafeMath.sol';
import '../interfaces/IFlashBorrower.sol';
import '../interfaces/IFlashLender.sol';
import '../interfaces/IRocketTokenRETH.sol';
import '../interfaces/IRocketDepositPool.sol';
import '../interfaces/IERC20.sol';

contract FlashLoanBorrower is IFlashBorrower {
    using SafeMath for uint256;

    enum Action {NORMAL, OTHER}

    address owner;
    IRocketDepositPool rocket_deposit_pool;
    IRocketTokenRETH reth_token;
    IFlashLender lender;

    constructor(address _lender, address _reth_token_address, address _rocket_deposit_pool_address) {
        owner = msg.sender;
        lender = IFlashLender(_lender);
        reth_token = IRocketTokenRETH(_reth_token_address);
        rocket_deposit_pool = IRocketDepositPool(_rocket_deposit_pool_address);
    }

    function fund() payable external {}

    // this function gets called by the lender
    function onFlashLoan(
        address initiator,
        address,
        uint256,
        uint256 fee,
        bytes calldata data
    ) external override returns(bytes32) {
        require(
            msg.sender == address(lender),
            "FlashBorrower: Untrusted lender"
        );
        require(
            initiator == address(this),
            "FlashBorrower: Untrusted loan initiator"
        );
        (Action action) = abi.decode(data, (Action));
        if (action == Action.NORMAL) {
            require(address(this).balance > fee, "You need to fund the stubbed borrower with more ETH.");
            rocket_deposit_pool.deposit{ value: address(this).balance }();
        } 
        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }

    function flashBorrow(
        uint256 amount
    ) public {
        bytes memory data = abi.encode(Action.NORMAL);
        uint256 _allowance = reth_token.allowance(address(this), address(lender));
        uint256 _fee = lender.flashFee(address(reth_token), amount);
        uint256 _repayment = amount + _fee;
        reth_token.approve(address(lender), _allowance + _repayment);
        lender.flashLoan(this, address(reth_token), amount, data);
    }
}
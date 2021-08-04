// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

interface IRocketStake {
    function stake() external payable; 
    function withdraw(uint256 eth_amount) external;
    function totalRETHCollateral() external view returns(uint256);
    function totalRETHHeld() external view returns(uint256);
    function totalETHHeld() external view returns(uint256);
    function register() external;
    function migrate(address next_contract_address, uint256 eth_amount) external;
    function depositCooldownPassed(address staker) external view returns(bool);
    function accountDepositDelay(address staker) external view returns(
        uint256 _last_deposit_block,
        uint256 _block_number,
        uint256 _deposit_delay
    );
    function accountStakedRETH(address staker) external view returns(uint256 staked_reth);
    function accountExists(address staker) external view returns(bool exists);
    function accountStakedETH(address staker) external view returns(uint256 eth_amount);

    event Register(address indexed staker_address);
    event AddStake(address indexed staker_address, uint256 reth_added_to_stake, uint256 eth_added_to_stake, uint256 staked_reth);
    event AccountWithdraw(address indexed staker_address, uint256 withdrawn_eth, uint256 staked_reth);
}
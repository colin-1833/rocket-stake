// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.7.6;

interface IRocketStake {
    // primary functions
    function stake() external payable; 
    function withdraw(uint256 eth_amount) external;
    function register() external;
    function migrate(address next_contract_address, uint256 eth_amount) external;

    // view functions
    function depositDelay(address staker) external view returns(
        uint256 _last_deposit_block,
        uint256 _block_number,
        uint256 _deposit_delay
    );
    function stakedETH(address staker) external view returns(uint256 eth_amount);
    function stakedRETH(address staker) external view returns(uint256 staked_reth);
    function registered(address staker) external view returns(bool exists);
    function buyerAddress(address staker) external view returns(address);
    function rocketPoolRETHCollateral() external view returns(uint256);
    function totalRETHHeld() external view returns(uint256);
    function totalETHHeld() external view returns(uint256);

    // events
    event Register(address indexed staker_address);
    event Stake(address indexed staker_address, uint256 reth_added_to_stake, uint256 eth_added_to_stake, uint256 staked_reth);
    event Withdraw(address indexed staker_address, uint256 withdrawn_eth, uint256 staked_reth);
    event Migrate(address indexed staker_address, address next_contract_address, uint256 eth_received);
}
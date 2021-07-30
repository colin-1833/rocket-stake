// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

interface IRocketStake {
    function claimFlashloanDevFees() external;
    function updateFlashLoanFeeManager(address _flash_loan_fee_manager) external;
    function updateFlashLoanDevCut(uint256 _flash_loan_dev_cut) external;
    function updateFlashLoanFee(uint256 _flash_loan_fee) external;
    function updateRocketPoolStorageKeyManager(address _rocket_pool_storage_key_manager) external;
    function updateRocketDepositPoolStorageKey(bytes32 storage_key) external;
    function updateRocketRethTokenStorageKey(bytes32 storage_key) external;
    function distributeRewards() payable external;
    function stake() external payable; 
    function withdraw(uint256 eth_amount) external;
    function totalRETHCollateral() external view returns(uint256);
    function totalRETHHeld() external view returns(uint256);
    function getRocketPoolStorageKeyManager() external view returns(address);
    function flashLoanDevFeesTotal() external view returns(uint256 reth);
    function flashLoanStakerFeesTotal() external view returns(uint256 reth);
    function flashLoanFee() external view returns(uint256 fee);
    function flashLoanDevCut() external view returns(uint256 dev_cut);
    function flashLoanManager() external view returns(address flash_loan_manager);
    function rocketStorageAddress() external view returns(address);
    function rocketDepositPoolStorageKey() external view returns(bytes32);
    function rocketRethTokenStorageKey() external view returns(bytes32);
    function accountStakedRETH(address staker) external view returns(uint256 staked_reth);
    function accountStakedETH(address staker) external view returns(uint256 eth_amount);

    event UpdatedFlashLoanFeeManager(address indexed _flash_loan_fee_manager);
    event UpdatedFlashLoanDevCut(uint256 _flash_loan_dev_cut);
    event UpdatedFlashLoanFee(uint256 _flash_loan_fee);
    event UpdatedStakerVersionContract(address _staker_version_contract);
    event Register(address indexed staker_address);
    event AddStake(address indexed staker_address, uint256 reth_added_to_stake, uint256 eth_added_to_stake, uint256 staked_reth);
    event AccountWithdraw(address indexed staker_address, uint256 withdrawn_eth, uint256 staked_reth);
    event UpdatedRocketPoolStorageKeyManager(address rocket_pool_storage_key_manager);
    event UpdatedRocketStorageAddress(address storage_address);
    event UpdatedRocketDepositPoolStorageKey(bytes32 storage_key);
    event UpdatedRocketRethTokenStorageKey(bytes32 storage_key);
    event DepositedRewards(address depositor, uint256 rewards);
}
// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

import './libraries/Counters.sol';
import './libraries/SafeMath.sol';
import './interfaces/IERC20.sol';
import './interfaces/IRocketStake.sol';
import './interfaces/IRocketStorage.sol';
import './interfaces/IRocketDepositPool.sol';
import './interfaces/IRocketTokenRETH.sol';
import './interfaces/IFlashLender.sol';

contract RocketStake is IRocketStake, IFlashLender {
    using SafeMath for uint256;

    struct Staker {
        uint256 flash_loan_fee_entitlement_floor;
        uint256 staked_reth;
        bool exists;
    }

    mapping(address => Staker) internal stakers;
    bool enable_manual_rewards;
    
    address rocket_pool_storage_key_manager;
    address rocket_storage_address;
    bytes32 rocket_deposit_pool_address_storage_key = keccak256(abi.encodePacked("contract.address", "rocketDepositPool"));
    bytes32 rocket_reth_token_address_storage_key = keccak256(abi.encodePacked("contract.address", "RocketTokenRETH"));

    address flash_loan_fee_manager;
    uint256 flash_loan_fee = 5000; // = .05%
    uint256 flash_loan_dev_cut = 500; // = 50% 
    uint256 flash_loan_dev_fees = 0;
    uint256 flash_loan_staker_fees = 0;
    bytes32 public constant FLASH_LOAN_CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    constructor(
        address _rocket_storage_address,
        bool _enable_manual_rewards
    ) {
        rocket_storage_address = _rocket_storage_address;
        rocket_pool_storage_key_manager = msg.sender;
        flash_loan_fee_manager = msg.sender;
        enable_manual_rewards = _enable_manual_rewards;
    }

    receive() external payable {}

    /* Makes it possible to change the RP storage key if possible. Set manager address(0) to lock */

    function updateRocketPoolStorageKeyManager(address _rocket_pool_storage_key_manager) external override {
        require(msg.sender == rocket_pool_storage_key_manager, "You must be a key manager");
        rocket_pool_storage_key_manager = _rocket_pool_storage_key_manager;
        emit UpdatedRocketPoolStorageKeyManager(_rocket_pool_storage_key_manager);
    }
    function updateRocketDepositPoolStorageKey(bytes32 storage_key) external override {
        require(msg.sender == rocket_pool_storage_key_manager, "You must be a key manager");
        rocket_deposit_pool_address_storage_key = storage_key;
        emit UpdatedRocketDepositPoolStorageKey(storage_key);
    }
    function updateRocketRethTokenStorageKey(bytes32 storage_key) external override {
        require(msg.sender == rocket_pool_storage_key_manager, "You must be a key manager");
        rocket_reth_token_address_storage_key = storage_key;
        emit UpdatedRocketRethTokenStorageKey(storage_key);
    }
    function getRocketPoolStorageKeyManager() external override view returns(address _guardian) {
        return(rocket_pool_storage_key_manager);
    }
    function rocketStorageAddress() external override view returns(address _rocket_storage_address) {
        return(rocket_storage_address);
    }
    function rocketDepositPoolStorageKey() external override view returns(bytes32 _rocket_deposit_pool_address_storage_key) {
        return(rocket_deposit_pool_address_storage_key);
    }
    function rocketRethTokenStorageKey() external override view returns(bytes32 _rocket_reth_token_address_storage_key) {
        return(rocket_reth_token_address_storage_key);
    }

    /* Main staker functions */

    function distributeRewards() external payable override {
        require(enable_manual_rewards, 'Cannot deposit rewards manually.');
        _rethContract().distributeRewards{ value: msg.value }();
        emit DepositedRewards(msg.sender, msg.value);
    }
    function stake() external payable override {
        require(msg.value > 0, "You must send a non-zero amount of eth to stake.");

        // setup staker
        if (stakers[msg.sender].exists != true) {
            stakers[msg.sender].exists = true;
            emit Register(msg.sender);
        }

        // setup RP contracts
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketDepositPool rocket_deposit_pool = IRocketDepositPool(rocket_storage.getAddress(rocket_deposit_pool_address_storage_key));
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(rocket_reth_token_address_storage_key));

        // deposit eth into RP and calculate the amount of rETH  added to this contract's balance
        uint256 reth_supply_before = rocket_token_reth.balanceOf(address(this));
        rocket_deposit_pool.deposit{ value: msg.value }();
        uint256 reth_supply_after = rocket_token_reth.balanceOf(address(this));
        uint256 reth_added_to_stake = reth_supply_after.sub(reth_supply_before);

        // update staker's balance
        uint256 original_staked_reth = stakers[msg.sender].staked_reth;
        stakers[msg.sender].staked_reth = stakers[msg.sender].staked_reth.add(reth_added_to_stake);

        // an abstract way to calc the amount of the total fees accumulated that a staker is entitled to
        stakers[msg.sender].flash_loan_fee_entitlement_floor = _calcNextFlashLoanFeeEntitlementFloor(
            flash_loan_staker_fees,
            stakers[msg.sender].flash_loan_fee_entitlement_floor,
            stakers[msg.sender].staked_reth,
            original_staked_reth
        );
        emit AddStake(msg.sender, reth_added_to_stake, msg.value, stakers[msg.sender].staked_reth);
    }
    function withdraw(uint256 eth_amount) external override {
        require(stakers[msg.sender].exists == true, "Nothing staked here.");
        require(eth_amount > 0, "You must withdraw more than 0 ETH");
        
        // setup RP contracts
        IRocketTokenRETH rocket_token_reth = _rethContract();
        
        // ensure there is enough eth available in RP's system
        require(rocket_token_reth.getTotalCollateral() >= eth_amount, "Not enough collateral available in Rocket Pool");

        // credit the staker with the rETH earned from flashloan fees
        stakers[msg.sender].staked_reth = stakers[msg.sender].staked_reth.add(_flashLoanRETHShare(msg.sender));

        // make sure we're not trying to withdraw more ETH than our rETH share is worth
        uint256 eth_able_to_be_withdrawn = rocket_token_reth.getEthValue(stakers[msg.sender].staked_reth);
        require(eth_amount <= eth_able_to_be_withdrawn, "You cannot withdraw more ETH than you have staked.");

        // burn the rETH to receive ETH via RP
        uint256 reth_to_burn = rocket_token_reth.getRethValue(eth_amount);
        uint256 starting_balance = address(this).balance;
        rocket_token_reth.burn(reth_to_burn);
        uint256 eth_received = address(this).balance.sub(starting_balance);

        // deduct the burned rETH from the stakers balance
        stakers[msg.sender].staked_reth = stakers[msg.sender].staked_reth.sub(reth_to_burn);

        // since we credited the staker's share of the fees already via _flashLoanRETHShare above, 
        // we can set the flash_loan_fee_entitlement_floor to the exact amount of fees in the system now
        // ensures that our staker is not over-credited with rETH
        stakers[msg.sender].flash_loan_fee_entitlement_floor = 0;

        // transfer staker ETH last to prevent re-entrancy
        payable(msg.sender).transfer(eth_received);
        emit AccountWithdraw(msg.sender, eth_received, stakers[msg.sender].staked_reth);
    }
    function accountStakedRETH(address staker) override public view returns(uint256 staked_reth) {
        return(
            stakers[staker].staked_reth.add(_flashLoanRETHShare(staker))
        );
    }
    function accountStakedETH(address staker) override public view returns(uint256 staked_eth) {
        return _rethContract().getEthValue(accountStakedRETH(staker));
    }
    function totalRETHCollateral() external override view returns(uint256 collateral) {
        return _rethContract().getTotalCollateral();
    }
    function totalRETHHeld() external override view returns(uint256 collateral) {
        return _rethContract().balanceOf(address(this));
    }

    /* Flash loan related */

    function updateFlashLoanFeeManager(address _flash_loan_fee_manager) external override {
        require(msg.sender == flash_loan_fee_manager, "Invalid permission");
        flash_loan_fee_manager = _flash_loan_fee_manager;
        emit UpdatedFlashLoanFeeManager(_flash_loan_fee_manager);
    }
    function updateFlashLoanDevCut(uint256 _flash_loan_dev_cut) external override {
        require(msg.sender == flash_loan_fee_manager, "Invalid permission");
        flash_loan_dev_cut = _flash_loan_dev_cut;
        emit UpdatedFlashLoanDevCut(_flash_loan_dev_cut);
    }
    function updateFlashLoanFee(uint256 _flash_loan_fee) external override {
        require(msg.sender == flash_loan_fee_manager, "Invalid permission");
        flash_loan_fee = _flash_loan_fee;
        emit UpdatedFlashLoanFee(_flash_loan_fee);
    }
    function flashLoan(
        IFlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external override returns(bool) {
        require(address(_rethContract()) == token, 'FlashLender: Unsupported currency');
        uint256 fee = amount.mul(flash_loan_fee).div(10000000);
        require(IERC20(token).transfer(address(receiver), amount), 'FlashLender: Transfer failed');
        require(
            receiver.onFlashLoan(msg.sender, token, amount, fee, data) == FLASH_LOAN_CALLBACK_SUCCESS, 
            'FlashLender: Callback failed'
        );
        require(
            IERC20(token).transferFrom(address(receiver), address(this), amount.add(fee)),
            "FlashLender: Repay failed"
        );
        uint256 dev_cut = fee.mul(flash_loan_dev_cut).div(1000);
        flash_loan_dev_fees = flash_loan_dev_fees.add(dev_cut);
        flash_loan_staker_fees = flash_loan_staker_fees.add(fee.sub(dev_cut));
        return true;
    }
    function flashFee(
        address token,
        uint256 amount
    ) external view override returns(uint256) {
        require(
            address(_rethContract()) == token,
            "FlashLender: Unsupported currency"
        );
        return amount.mul(flash_loan_fee).div(10000000);
    }
    function maxFlashLoan(
        address token
    ) external view override returns (uint256) {
        return token == address(_rethContract()) 
            ? IERC20(token).balanceOf(address(this)) 
            : 0;
    }
    function claimFlashloanDevFees() external override {
        require(msg.sender == flash_loan_fee_manager, "Invalid permission");
        uint256 rETH_to_claim = flash_loan_dev_fees;
        flash_loan_dev_fees = 0;
        _rethContract().transfer(flash_loan_fee_manager, rETH_to_claim);
    }
    function flashLoanDevFeesTotal() external view override returns(uint256 rETH) {
        return flash_loan_dev_fees;
    }
    function flashLoanStakerFeesTotal() external view override returns(uint256 rETH) {
        return flash_loan_staker_fees;
    }
    function flashLoanFee() external view override returns(uint256 fee) {
        return flash_loan_fee;
    }
    function flashLoanDevCut() external view override returns(uint256 dev_cut) {
        return flash_loan_dev_cut;
    }
    function flashLoanManager() external view override returns(address flash_loan_manager) {
        return flash_loan_fee_manager;
    }

    /* Helper functions */

    function _flashLoanRETHShare(address staker) internal view returns(uint256) {
        if (stakers[staker].exists != true) {
            return 0;
        }
        return stakers[staker].staked_reth
            .mul(flash_loan_staker_fees.sub(stakers[staker].flash_loan_fee_entitlement_floor))
            .div(_rethContract().balanceOf(address(this)));
    }
    // secret sauce to safely redistribute flash loan fees to stakers
    function _calcNextFlashLoanFeeEntitlementFloor(
        uint256 previous_entitlement_floor,
        uint256 fee_total,
        uint256 staker_reth_n_current,
        uint256 staker_reth_n_previous
    ) internal pure returns(uint256) {
        if (staker_reth_n_current == 0) {
            return fee_total;
        }
        if (staker_reth_n_previous == 0) {
            return fee_total;
        }
        return fee_total.sub(
            (
                fee_total
                    .mul(staker_reth_n_previous)
                    .div(staker_reth_n_current)
            )
                .sub(
                    previous_entitlement_floor
                        .mul(staker_reth_n_previous)
                        .div(staker_reth_n_current)
                )
        );
    }
    function _rethContract() internal view returns(IRocketTokenRETH rocket_token_reth) {
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketTokenRETH _rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(rocket_reth_token_address_storage_key));
        return _rocket_token_reth;
    }
}
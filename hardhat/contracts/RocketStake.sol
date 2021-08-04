// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

import './libraries/Counters.sol';
import './libraries/SafeMath.sol';
import './interfaces/IERC20.sol';
import './interfaces/IRocketStake.sol';
import './interfaces/IRocketStorage.sol';
import './interfaces/IMigrationCompatible.sol';
import './interfaces/IRocketDepositPool.sol';
import './interfaces/IRocketTokenRETH.sol';

contract RETHBuyer {
    using SafeMath for uint256;
    
    address rocket_storage_address;
    address rocket_stake_address;

    constructor(address _rocket_storage_address) {
        rocket_storage_address = _rocket_storage_address;
        rocket_stake_address = msg.sender;
    }

    function burn(uint256 reth_amount) external returns(uint256 _eth_received) {
        require(msg.sender == rocket_stake_address, "Only RocketStake can do that");
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketTokenRETH"))));
        uint256 starting_balance = address(this).balance;
        rocket_token_reth.burn(reth_amount);
        uint256 eth_received = address(this).balance.sub(starting_balance);
        payable(rocket_stake_address).transfer(eth_received);
        return eth_received;
    } 

    function deposit() payable external returns(uint256 _reth_added_to_stake) {
        require(msg.sender == rocket_stake_address, "Only RocketStake can do that");
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketDepositPool rocket_deposit_pool = IRocketDepositPool(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketDepositPool"))));
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketTokenRETH"))));
        uint256 reth_supply_before = rocket_token_reth.balanceOf(address(this));
        rocket_deposit_pool.deposit{ value: msg.value }();
        uint256 reth_supply_after = rocket_token_reth.balanceOf(address(this));
        uint256 reth_added_to_stake = reth_supply_after.sub(reth_supply_before);
        return reth_added_to_stake;
    }

    function lastDepositBlock() external view returns(uint256 _last_deposit_block) {
        require(msg.sender == rocket_stake_address, "Only RocketStake can do that");
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        return rocket_storage.getUint(keccak256(abi.encodePacked("user.deposit.block", address(this))));
    }
}

contract RocketStake is IRocketStake {
    using SafeMath for uint256;

    struct Staker {
        RETHBuyer reth_buyer;
        uint256 staked_reth;
        bool exists;
    }

    uint256 total_reth_held;
    mapping(address => Staker) internal stakers;
    address rocket_storage_address;

    constructor(address _rocket_storage_address) {
        rocket_storage_address = _rocket_storage_address;
    }

    receive() external payable {}

    function register() external override {
        if (stakers[msg.sender].exists != true) {
            stakers[msg.sender].exists = true;
            stakers[msg.sender].reth_buyer = new RETHBuyer(rocket_storage_address);
            emit Register(msg.sender);
        }
    }

    function stake() external payable override {
        require(msg.value > 0, "You must send a non-zero amount of eth to stake.");
        
        // register and create reth_buyer if doesn't exist already
        if (stakers[msg.sender].exists != true) {
            stakers[msg.sender].exists = true;
            stakers[msg.sender].reth_buyer = new RETHBuyer(rocket_storage_address);
            emit Register(msg.sender);
        }

        // have the reth_buyer deposit eth for rETH and hold on to it
        uint256 reth_added_to_stake = stakers[msg.sender].reth_buyer.deposit{ value: msg.value }();

        // update balances
        total_reth_held = total_reth_held.add(reth_added_to_stake);
        stakers[msg.sender].staked_reth = stakers[msg.sender].staked_reth.add(reth_added_to_stake);
        emit AddStake(msg.sender, reth_added_to_stake, msg.value, stakers[msg.sender].staked_reth);
    }

    function withdraw(uint256 eth_amount) external override {
        require(stakers[msg.sender].exists == true, "Nothing staked here.");
        require(stakers[msg.sender].staked_reth > 0, "Nothing staked here.");
        require(eth_amount > 0, "You must withdraw more than 0 ETH");
        require(depositCooldownPassed(msg.sender) == true, "Rocket Pool will not let you move or withdraw your rETH yet.");
        
        // setup RP contracts
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketTokenRETH"))));
        
        // ensure there is enough eth available in RP's system
        require(rocket_token_reth.getTotalCollateral() >= eth_amount, "Not enough collateral available in Rocket Pool");

        // make sure we're not trying to withdraw more ETH than our rETH share is worth
        uint256 eth_able_to_be_withdrawn = rocket_token_reth.getEthValue(stakers[msg.sender].staked_reth);
        require(eth_amount <= eth_able_to_be_withdrawn, "You cannot withdraw more ETH than you have staked.");

        // tell the buyer contract to burn some of its rETH and send the ETH proceeds back to this contract
        uint256 reth_to_burn = rocket_token_reth.getRethValue(eth_amount);
        total_reth_held = total_reth_held.sub(reth_to_burn);
        uint256 eth_received = stakers[msg.sender].reth_buyer.burn(reth_to_burn);
        stakers[msg.sender].staked_reth = stakers[msg.sender].staked_reth.sub(reth_to_burn);

        // transfer staker ETH last to prevent re-entrancy
        payable(msg.sender).transfer(eth_received);
        emit AccountWithdraw(msg.sender, eth_received, stakers[msg.sender].staked_reth);
    }

    function migrate(
        address next_contract_address,
        uint256 eth_amount
    ) override public {
        // make sure there is a stake to migrate and 
        // that we aren't migrating into a non-existant address
        require(eth_amount > 0, "You must migrate some ETH");
        require(stakers[msg.sender].staked_reth > 0, "You are not staking any ETH");
        require(next_contract_address != address(0), "Cannot migrate to non-existant contract");
        require(depositCooldownPassed(msg.sender) == true, "Rocket Pool will not let you move or withdraw your rETH yet.");

        // setup RP contracts
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketTokenRETH"))));

        // ensure there is enough eth available in RP's system
        require(rocket_token_reth.getTotalCollateral() >= eth_amount, "Not enough collateral available in Rocket Pool");

        // calculate the ETH value of our rETH staked and prevent overdrawing
        uint256 eth_able_to_be_withdrawn = rocket_token_reth.getEthValue(stakers[msg.sender].staked_reth);
        require(eth_amount <= eth_able_to_be_withdrawn, "You cannot migrate that much.");

        // tell the buyer contract to burn some of its rETH and send the ETH proceeds back to this contract
        uint256 reth_to_burn = rocket_token_reth.getRethValue(eth_amount);
        total_reth_held = total_reth_held.sub(reth_to_burn);
        uint256 eth_received = stakers[msg.sender].reth_buyer.burn(reth_to_burn);
        stakers[msg.sender].staked_reth = stakers[msg.sender].staked_reth.sub(reth_to_burn);

        // go through the transfer protocol, caller better know they can trust the contract they're migrating to
        IMigrationCompatible(next_contract_address).startTransfer(eth_received, msg.sender);
        payable(msg.sender).transfer(eth_received);
        IMigrationCompatible(next_contract_address).closeTransfer(eth_received, msg.sender);
        total_reth_held = total_reth_held.sub(reth_to_burn);
    }

    function accountDepositDelay(address staker) override external view returns(
        uint256 _last_deposit_block,
        uint256 _block_number,
        uint256 _deposit_delay
    ) {
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        uint256 deposit_delay = rocket_storage.getUint(keccak256(abi.encodePacked(keccak256("dao.protocol.setting.network"), "network.reth.deposit.delay")));
        return(
            stakers[staker].exists == true 
                ? stakers[staker].reth_buyer.lastDepositBlock()
                : 0,
            block.number,
            deposit_delay
        );
    }
    
    function accountStakedETH(address staker) override external view returns(uint256 staked_eth) {
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketTokenRETH"))));
        return rocket_token_reth.getEthValue(stakers[staker].staked_reth);
    }

    function accountStakedRETH(address staker) override external view returns(uint256 staked_reth) {
        return stakers[staker].staked_reth;
    }

    function accountExists(address staker) override external view returns(bool exists) {
        return stakers[staker].exists;
    }

    function accountBuyerAddress(address staker) external view returns(address) {
        return stakers[staker].exists == true ? address(stakers[staker].reth_buyer) : address(0);
    }

    function totalRETHCollateral() external override view returns(uint256 collateral) {
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketTokenRETH"))));
        return rocket_token_reth.getTotalCollateral();
    }

    function totalRETHHeld() external override view returns(uint256 collateral) {
        return total_reth_held;
    }

    function totalETHHeld() external override view returns(uint256 collateral) {
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        IRocketTokenRETH rocket_token_reth = IRocketTokenRETH(rocket_storage.getAddress(keccak256(abi.encodePacked("contract.address", "rocketTokenRETH"))));
        return rocket_token_reth.getEthValue(total_reth_held);
    }

    function depositCooldownPassed(address staker) public override view returns(bool) {
        if (stakers[staker].exists != true) {
            return true;
        }
        IRocketStorage rocket_storage = IRocketStorage(rocket_storage_address);
        uint256 deposit_delay = rocket_storage.getUint(keccak256(abi.encodePacked(keccak256("dao.protocol.setting.network"), "network.reth.deposit.delay")));
        return block.timestamp.sub(stakers[staker].reth_buyer.lastDepositBlock()) > deposit_delay;
    }
}
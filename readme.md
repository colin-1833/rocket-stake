##### Warning: Use at your own risk! This software is not audited.

# About

A solidity smart contract and react frontend that provides access to non-custodian decentralized staking on Ethereum.

# Try it on Prater:

https://goerli.rocketstake.org 

# Motivation 

The staking community has expressed concerns about the tax implications of directly swapping ETH => rETH. The design of Rocket Pool ensures that the rETH/ETH ratio grows over time. This means that the exchange of ETH for rETH would be a taxable event in most countries, thereby disincentivizing many ETH holders with large unrealized capital gains from taking part in rETH staking. 

# RocketStake's Solution 

RocketStake's web frontend allows ETH holders to "lend" their ETH to RocketStake via MetaMask. Behind the scenes RocketStake converts ETH into rETH. Lenders cannot withdraw rETH directly from the contract, only ETH.

# Does RocketStake take a percentage of staking rewards?

No. The RocketStake contract is a public utility. 

# What is Rocket Pool and rETH?

Rocket Pool is a network of smart contracts that incentive decentralized staking on the ETH 2.0 network. Learn more about Rocket Pool by going to [their site](https://rocketpool.net) or interacting with their discord community (one of the best in the crypto space). Their contracts are slated to deploy on Mainnet sometime in late 2021. [Read more about how Rocket Pool works](https://docs.rocketpool.net/guides/staking/overview.html#how-rocket-pool-works).

# Does the official Rocket Pool team endorse RocketStake?

No. Yay for permissionless finance.

# Can I Withdraw Whenever I Want?

Currently, on goerli, RocketStake cannot do anything with newly minted [rETH for 24 hours](https://github.com/rocket-pool/rocketpool/blob/3d6df4c87401f303f6acbdd249bdcb182e8827f3/contracts/contract/token/RocketTokenRETH.sol#L157). This means you will not be able to withdraw ETH from RocketStake for 24 hours after adding to your current  stake. Additionally, withdrawals from RocketStake are capped by the amount of available ETH in the [Rocket Pool's rETH token contract](https://github.com/rocket-pool/rocketpool/blob/master/contracts/contract/token/RocketTokenRETH.sol). This means that it could be hard to withdraw from RocketStake before withdrawals are enabled on ETH 2.0. If you are not familiar with ETH 2.0, please read up on the [Ethereum Foundation's ETH 2.0 learning materials](https://ethereum.org/en/eth2/).

# Tax Disclaimer

It is possible that many countries will consider a RocketStake swap "on your behalf" to be taxable the same way it would be if you made the swap directly yourself. You will need to consult a tax professional to better guage the risk of different tax strategies. 

# Can this contract be changed?

No. A staker can, individually and voluntarily, move their staked ETH to a new contract that is more useful than RocketStake, but nothing is forced upon RocketStake users.
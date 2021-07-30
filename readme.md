##### Warning: Use at your own risk! This software is not audited.

# About

A solidity smart contract and react frontend to generate passive income through exposure to rETH, [Rocket Pool's](https://rocketpool.net) liquid staking token, and flash loan fees.

# Motivation 

The staking community has expressed concerns about the tax implications of directly swapping ETH => rETH. The design of Rocket Pool ensures that the rETH/ETH ratio grows over time. This means that the exchange of ETH for rETH would be a taxable event in most countries, thereby disincentivizing many ETH holders with large unrealized capital gains from taking part in rETH staking. 

# RocketStake's Solution 

RocketStake's web frontend allows ETH holders to "lend" their ETH to RocketStake via MetaMask. Behind the scenes RocketStake converts your lent ETH into rETH and puts it to use by exposing it to flash loan traders. Fees accumulated from flash loan trades are redistributed to the ETH lenders. Theoretically, lending ETH to RocketStake could provide better returns than investing in rETH directly. However, if you aren't comfortable auditing RocketStake's contract yourself we encourage you to invest directly in rETH instead. **Rocket Pool has undergone several audits while RocketStake has not.**

# Can I Withdraw Whenever I Want?

Withdraws from RocketStake are capped by the amount of available ETH in the [Rocket Pool's rETH token contract](https://github.com/rocket-pool/rocketpool/blob/master/contracts/contract/token/RocketTokenRETH.sol). This means that it could be hard to withdraw from RocketStake before withdrawals are enabled on ETH 2.0. If you are not familiar with ETH 2.0, please read up on the [Ethereum Foundation's ETH 2.0 learning materials](https://ethereum.org/en/eth2/).

# What is Rocket Pool and rETH?

Rocket Pool is a network of smart contracts that incentive decentralized staking on the ETH 2.0 network. Learn more about Rocket Pool by going to their [site](https://rocketpool.net) or interacting with its discord community (one of the best in the crypto space). Their contracts are slated to deploy on Prater (Goerli) and then Mainnet sometime in late 2021. [Read more about how Rocket Pool works](https://docs.rocketpool.net/guides/staking/overview.html#how-rocket-pool-works).

# Tax Disclaimer

It is possible that many countries will consider a RocketStake swap "on your behalf" to be taxable the same way it would be if you made the swap directly yourself. You will need to consult a tax professional to better guage the risk of different tax strategies. 

# Can this contract be changed?

No. If a new version is released stakers will need to manually withdraw funds and move to the new contract.

# How does RocketStake make a profit?

RocketStake only profits if their is significant flash loan activity, as it takes a percent of all flash loan fees, currently set to 50%. This percent will be reduced as RocketStake grows and competition comes online.

# Testnet Demos:

* https://kovan.rocketstake.org
* https://ropsten.rocketstake.org
* https://rinkeby.rocketstake.org
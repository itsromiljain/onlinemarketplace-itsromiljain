# Design Pattern Decisions (Used Module 10.1 Smart Contract Design Patterns for reference)

## Fail early and fail loud
Instead of `if` used `require` in the modifiers and functions

## Restricting Access
The following modifiers restrict access to certain functions: 

#### OnlineMarket.sol 
- onlyOwner()
- onlyAdmin()

#### StoreFront.sol 
- onlyStoreOwner(bytes32 storeId)
- onlyApprovedStoreOwner()

## Auto Deprecation
Not used. There is nothing in the application that is expire/be deprecated.

## Mortal
Not Used. Though we can add selfDestruct to both the contracts.

## Pull over Push Payments (the Withdrawal Pattern)
The `buyProduct` function in  `StoreFront.sol` is payable which doesn't transfer funds to the `storeOwner` directly but increments the `balance`. The store balance withdrawals can be done only via the `withdrawStoreBalance` function.

## Circuit Breaker
Implmented it using OpenZeppelin Pausable. Both the Contracts are extending the OpenZeppelin `Pausable` library.  
Used `whenNotPaused` modifier to freeze the contract when required. Only the `owner` can `pause` and `unpause` the contracts. 
When contracts are paused, No functions can be called.

## State Machine
Not implemented. As there was no state to be maintained for the stores or products. If there is requirement for products to be purchased, shipped, recieved etc like SupplyChain then it could have been used.

## Speed Bump
Not implemented. It can be used as `slowWithdrawStoreBalance` which could have allowed storeOwners to withdraw their store balances the contract had been paused.

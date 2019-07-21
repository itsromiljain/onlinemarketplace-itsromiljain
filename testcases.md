# Test Cases

All tests are located in `/test` folder and can be run using either `truffle test` with a test blockchain running, or `truffle develop`, and from the truffle console, running `test`. 

The main goal for the tests is to validate that contracts' basic functionality works as expected. 
Around 42 test cases are writtent to cover all the functionality of both the smart contracts `OnlineMarket` & `StoreFront`.
The test cases are written in Javascript, though there are test cases available in Solidity as well which covers some generic functionality.

## Javascript Tests 
**Files** `onlinemarketTest.js`, `storefrontTest.js`
There are around 20 test cases for `OnlineMarket` and around 22 test cases for `StoreFront`. All the test cases were written right after the completion of Smart Contracts and before working on the UI to make sure functionality works as expected. While testing what all the bugs were identified, Smart contracts were updated accordingly. In addition to it some bugs were identified while testing from UI, contracts were updated for those bugs and test cases were also updated accordingly to make sure they are fixed and no regression happened.

## Solidity Tests 
**Files:** `TestOnlineMarket.sol`, `TestStoreFront.sol` 

All the test cases are in order of the functionality provided in both the smart contracts. Specific test conditions are written to check the modifiers like Ownable & Pausable.



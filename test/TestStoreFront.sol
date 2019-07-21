pragma solidity 0.5.8;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/OnlineMarket.sol";
import "../contracts/StoreFront.sol";
import "../contracts/Proxy.sol";

contract TestStoreFront {
    uint public initialBalance = 1 ether;

    OnlineMarket public onlineMarket;
    StoreFront public storeFront;
    Proxy storeOwnerOne;

    constructor() public payable {}

    event LogStoreOwnerAddress(address storeOwnerOne, address owner);

    function beforeAll() public {
        onlineMarket = OnlineMarket(DeployedAddresses.OnlineMarket());
        storeFront = StoreFront(DeployedAddresses.StoreFront());
        storeOwnerOne = new Proxy(onlineMarket);
    }

    function testCreateStore() public {
        Assert.equal(storeFront.getTotalStoresCount(), 0, "There are no stores created");
    }
    
    function() external payable{}
}
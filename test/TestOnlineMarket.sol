pragma solidity 0.5.8;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/OnlineMarket.sol";
import "../contracts/Proxy.sol";


contract TestOnlineMarket {

    uint public initialBalance = 1 ether;

    OnlineMarket onlineMarket;

    Proxy storeOwnerOne;

    constructor() public payable {}

    event LogStoreOwnerAddress(address storeOwnerOne, address owner);

    function beforeAll() public {
        onlineMarket = OnlineMarket(DeployedAddresses.OnlineMarket());
        storeOwnerOne = new Proxy(onlineMarket);
    }

    function testOwnerIsAdmin() public { 
        address owner = msg.sender;
		Assert.equal(onlineMarket.checkAdmin(owner), true, "Owner should be an administrator");
	}
    
    function testAnyOtherAddressIsAdmin() public { 
        Assert.equal(onlineMarket.checkAdmin(address(storeOwnerOne)), false, "Any other account should not be an administrator");
    }

    function() external {}
    
}
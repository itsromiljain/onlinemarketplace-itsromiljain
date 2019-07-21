pragma solidity 0.5.8;

import "../contracts/OnlineMarket.sol";

contract Proxy {

    OnlineMarket public _onlineMarket;

    constructor(OnlineMarket onlineMarket) public { _onlineMarket = onlineMarket; }

    function() external payable {}

    /*function getTarget() public view returns (OnlineMarket){
        return _onlineMarket;
    }*/

    function checkAdmin(address admin) public returns(bool){
        (bool success,) = address(_onlineMarket).call(abi.encodeWithSignature("checkAdmin(address)",admin));
       return success;
    }  

    function approveStoreOwners(address storeOwner) public returns(bool){
        (bool success,) = address(_onlineMarket).call(abi.encodeWithSignature("approveStoreOwners(address)",storeOwner));
       return success;
    }   
}

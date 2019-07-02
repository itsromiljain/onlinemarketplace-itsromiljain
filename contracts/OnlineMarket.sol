pragma solidity >=0.4.0 <0.7.0;

contract OnlineMarket{
    
    //Owner
    address owner;
    
    // Admin mapping
    mapping(address => bool) admins;
    
    //Mapping of StoreOwner approved or not by Admin
    mapping(address => bool) storeOwnerApprovalMapping;
    
    // Hold the Store Owners who are reauested
    address[] private requestedStoreOwners;
    
    // Hold the Store Owners who are approved
    address[] private approvedStoreOwners;
    
    constructor() public{
        admins[msg.sender] = true;
    }
    
    // Add admin
    function addAdmin(address adminAddress) public {

    }
    
    // Remove Admin
    function removeAdmin(address adminAddress) public {
    
    }
    
    //Check if Admin
    function checkAdmin(address adminAddress) public view returns(bool){
        
    }
    
    // Below function is to view a requested StoreOwners at index by Admin
    function viewRequestedStoreOwner(uint index) public view returns (address){
        
    }
    
    // Below function is to view all requested StoreOwners by Admin
    function viewRequestedStoreOwners() public view returns (address[] memory){
        
    }
    
    // Below function is to view a approved StoreOwners at index by Admin
    function viewApprovedStoreOwner(uint index) public view returns (address){
        
    }
    
    // Below function is to view all approved StoreOwners by Admin
    function viewApprovedStoreOwners() public view returns (address[] memory){
        
    }
    
    // Below function is to approve the Stores by Admin
    function approveStoreOwners(address storeOwner) public {
        
    }
    
    // Below function is to remove the storeOwnerAddress by Admin
    function removeStoreOwner(address storeOwner) public {
        
    }
    
    function checkStoreOwnerStatus(address storeOwner) public view returns(bool){
        
    }
    
    // Add storeOwner
    function addStoreOwner() public {
        
    }
    
    // get requested store owners length
    function getRequestedStoreOwnersLength() public view returns(uint){
        
    }
    
    // get approved store owners length
    function getApprovedStoreOwnersLength() public view returns(uint){
        
    }
    
}
pragma solidity >=0.4.0 <0.7.0;

contract OnlineMarket{
    constructor() public{
        admins[msg.sender] = true;
    }
    
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

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyAdmin(){
        require(admins[msg.sender] == true);
        _;
    }
    
    // Add admin
    function addAdmin(address adminAddress) public onlyAdmin{
        admins[adminAddress] = true;
    }
    
    // Remove Admin
    function removeAdmin(address adminAddress) public onlyOwner{
        require(admins[adminAddress] == true);
        admins[adminAddress] = false;
    }
    
    //Check if Admin
    function checkAdmin(address adminAddress) public view returns(bool){
        return admins[adminAddress];
    }
    
}
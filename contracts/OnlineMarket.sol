pragma solidity 0.5.8;

contract OnlineMarket{
    
    //Owner
    address owner;
    
    // Admin mapping
    mapping(address => bool) private admins;
    
    //Mapping of StoreOwner approved or not by Admin
    mapping(address => bool) private storeOwnerApprovalMapping;
    
    // Hold the Store Owners who are requested
    address[] private requestedStoreOwners;
    mapping(address => uint) private requestedStoreOwnersIndex;
    
    // Hold the Store Owners who are approved
    address[] private approvedStoreOwners;
    mapping(address => uint) private approvedStoreOwnersIndex;

    event LogAdminAdded(address adminAddress);
    event LogAdminRemoved(address adminAddress);
    event LogStoreOwnersApproved(address storeOwner);
    event LogStoreOwnerRemoved(address storeOwner);
    event LogStoreOwnerAdded(address storeOwner);

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyAdmin(){
        require(admins[msg.sender] == true);
        _;
    }

    constructor() public{
        owner = msg.sender;
        admins[msg.sender] = true;
    }
    
    // Add admin
    function addAdmin(address adminAddress) public onlyAdmin{
        admins[adminAddress] = true;
        emit LogAdminAdded(adminAddress);
    }
    
    // Remove Admin
    function removeAdmin(address adminAddress) public onlyOwner{
        require(admins[adminAddress] == true);
        admins[adminAddress] = false;
        emit LogAdminRemoved(adminAddress);
    }
    
    //Check if Admin
    function checkAdmin(address adminAddress) public view returns(bool){
        return admins[adminAddress];
    }

    // Below function is to view a requested StoreOwners at index by Admin
    function viewRequestedStoreOwner(uint index) public view onlyAdmin returns (address){
        return requestedStoreOwners[index];
    }
    
    // Below function is to view all requested StoreOwners by Admin
    function viewRequestedStoreOwners() public view onlyAdmin returns (address[] memory){
        return requestedStoreOwners;
    }
    
    // Below function is to view a approved StoreOwners at index by Admin
    function viewApprovedStoreOwner(uint index) public view onlyAdmin returns (address){
        return approvedStoreOwners[index];
    }
    
    // Below function is to view all approved StoreOwners by Admin
    function viewApprovedStoreOwners() public view onlyAdmin returns (address[] memory){
        return approvedStoreOwners;
    }

    // Below function is to approve the Stores by Admin
    function approveStoreOwners(address storeOwner) public onlyAdmin{
        //Updated mapping with status of approval
        storeOwnerApprovalMapping[storeOwner] = true;
        // remove it from requested store owners
        removeRequestedStoreOwner(storeOwner);
        // Add it to approved store owners
        approvedStoreOwners.push(storeOwner);
        approvedStoreOwnersIndex[storeOwner] = approvedStoreOwners.length-1;
        emit LogStoreOwnersApproved(storeOwner);
    }
    
    // Below function is to remove the approve storeOwnerAddress by Admin
    function removeStoreOwner(address storeOwner) public onlyAdmin returns(bool){
        //Updated mapping with false
        storeOwnerApprovalMapping[storeOwner] = false;
        // remove it from approved store owners
        removeApprovedStoreOwner(storeOwner);
        emit LogStoreOwnerRemoved(storeOwner);
        return true;
    }
    
    function checkStoreOwnerStatus(address storeOwner) public view returns(bool){
        return storeOwnerApprovalMapping[storeOwner];
    }
    
    // Add storeOwner
    function addStoreOwner() public returns(bool){
        require(storeOwnerApprovalMapping[msg.sender] == false);
        requestedStoreOwners.push(msg.sender);
        requestedStoreOwnersIndex[msg.sender] = requestedStoreOwners.length-1;
        emit LogStoreOwnerAdded(msg.sender);
        return true;
    }
    
    // get requested store owners length
    function getRequestedStoreOwnersLength() public view returns(uint){
        return requestedStoreOwners.length;
    }
    
    // get approved store owners length
    function getApprovedStoreOwnersLength() public view returns(uint){
        return approvedStoreOwners.length;
    }

    function removeRequestedStoreOwner(address storeOwner) private onlyAdmin{
        uint index = requestedStoreOwnersIndex[storeOwner];
        if (requestedStoreOwners.length > 1) {
            requestedStoreOwners[index] = requestedStoreOwners[requestedStoreOwners.length-1];
        }
        requestedStoreOwners.length--;
    }
    function removeApprovedStoreOwner(address storeOwner) private onlyAdmin{
        uint index = approvedStoreOwnersIndex[storeOwner];
        if (approvedStoreOwners.length > 1) {
            approvedStoreOwners[index] = approvedStoreOwners[approvedStoreOwners.length-1];
        }
        approvedStoreOwners.length--;
    }
    
}
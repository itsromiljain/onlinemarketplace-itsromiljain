pragma solidity 0.5.8;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';

/*
* @title OnlineMarket 
*
* @dev This contract allows the addition and removal of admins and storefront owners 
* 
*/
contract OnlineMarket is Ownable, Pausable{
    
    //Owner
    //address owner;
    
    // Admin mapping
    mapping(address => bool) private admins;
    
    //Mapping of StoreOwner approved or not by Admin
    mapping(address => bool) private storeOwnerApprovalMapping;
    
    // Hold the requested Store Owners
    address[] private requestedStoreOwners;
    // Hold the requested Store Owners index against store owner Ids
    mapping(address => uint) private requestedStoreOwnersIndex;
    
    // Hold the approved Store Owners
    address[] private approvedStoreOwners;
    // Hold the approved Store Owners index against store owner Ids
    mapping(address => uint) private approvedStoreOwnersIndex;

    //Events which are emitted at various points
    event LogAdminAdded(address adminAddress);
    event LogAdminRemoved(address adminAddress);
    event LogStoreOwnersApproved(address storeOwner);
    event LogStoreOwnerRemoved(address storeOwner);
    event LogStoreOwnerAdded(address storeOwner);
    
    // Modifier to restrict function calls to only admin
    modifier onlyAdmin(){
        require(admins[msg.sender] == true);
        _;
    }

    /** @dev The account that deploys contract is made admin.
	*/
    constructor() public{
        admins[msg.sender] = true;
    }
    
   /** @dev Function is to add an Admin. Admins can add more admins.
	* @param adminAddress Address of the Admin
	*/ 
    function addAdmin(address adminAddress) public onlyAdmin whenNotPaused{
        admins[adminAddress] = true;
        emit LogAdminAdded(adminAddress);
    }
    
    /** @dev Function is to remove an Admin. OnlyOwner can remove admins
	* @param adminAddress Address of the Admin
	*/ 
    function removeAdmin(address adminAddress) public onlyOwner whenNotPaused{
        require(admins[adminAddress] == true);
        admins[adminAddress] = false;
        emit LogAdminRemoved(adminAddress);
    }
    
    /** @dev Function is to check if an address is Admin or not.
	* @param adminAddress Address of the Admin
    * @return true if address is admin otherwise false
	*/ 
    function checkAdmin(address adminAddress) public view returns(bool){
        return admins[adminAddress];
    }

    /** @dev Function is to view a requested StoreOwner at a particular index
	* @param index requested store owner index
    * @return address of requestedStoreOwner at the requested index
	*/ 
    function viewRequestedStoreOwner(uint index) public view onlyAdmin returns (address){
        return requestedStoreOwners[index];
    }
    
    /** @dev Function is to view all requested StoreOwners
    * @return addresses of all the requestedStoreOwner
	*/ 
    function viewRequestedStoreOwners() public view onlyAdmin returns (address[] memory){
        return requestedStoreOwners;
    }
    
    /** @dev Function is to view an approved StoreOwners at requested index
    * @return addresses of the approvedStoreOwner
	*/
    function viewApprovedStoreOwner(uint index) public view onlyAdmin returns (address){
        return approvedStoreOwners[index];
    }
    
    /** @dev Function is to view all approved StoreOwners
    * @return addresseses of all the approved StoreOwner
	*/
    function viewApprovedStoreOwners() public view onlyAdmin returns (address[] memory){
        return approvedStoreOwners;
    }

    /** @dev Function is to approve the Stores
    * @param storeOwner address
	*/
    function approveStoreOwners(address storeOwner) public onlyAdmin whenNotPaused{
        //Updated mapping with status of approval
        storeOwnerApprovalMapping[storeOwner] = true;
        // remove it from requested store owners
        removeRequestedStoreOwner(storeOwner);
        // Add it to approved store owners
        approvedStoreOwners.push(storeOwner);
        approvedStoreOwnersIndex[storeOwner] = approvedStoreOwners.length-1;
        emit LogStoreOwnersApproved(storeOwner);
    }

    /** @dev Function is to remove the approved storeOwner
    * @param storeOwner address
    * @return true if store is removed otherwise false
	*/
    function removeStoreOwner(address storeOwner) public onlyAdmin whenNotPaused returns(bool){
        //Updated mapping with false
        storeOwnerApprovalMapping[storeOwner] = false;
        // remove it from approved store owners
        removeApprovedStoreOwner(storeOwner);
        emit LogStoreOwnerRemoved(storeOwner);
        return true;
    }
    
    /** @dev Function is to check the status of the store owner
    * @param storeOwner address
    * @return true if store is approved otherwise false
	*/
    function checkStoreOwnerStatus(address storeOwner) public view returns(bool){
        return storeOwnerApprovalMapping[storeOwner];
    }
    
    /** @dev Function is to add store owner
    * @return true if store is added otherwise false
	*/
    function addStoreOwner() public whenNotPaused returns(bool){
        require(storeOwnerApprovalMapping[msg.sender] == false);
        requestedStoreOwners.push(msg.sender);
        requestedStoreOwnersIndex[msg.sender] = requestedStoreOwners.length-1;
        emit LogStoreOwnerAdded(msg.sender);
        return true;
    }
    
     /** @dev Function is to get requested store owners length
    * @return length of requestedStoreOwners
	*/
    function getRequestedStoreOwnersLength() public view returns(uint){
        return requestedStoreOwners.length;
    }
    
     /** @dev Function is to get approved store owners length
    * @return length of approvedStoreOwners
	*/
    function getApprovedStoreOwnersLength() public view returns(uint){
        return approvedStoreOwners.length;
    }

    /** @dev Function is to remove the requestedStoreOwner
    * @param storeOwner address
	*/
    function removeRequestedStoreOwner(address storeOwner) private onlyAdmin whenNotPaused {
        uint index = requestedStoreOwnersIndex[storeOwner];
        if (requestedStoreOwners.length > 1) {
            requestedStoreOwners[index] = requestedStoreOwners[requestedStoreOwners.length-1];
        }
        requestedStoreOwners.length--;
    }

    /** @dev Function is to remove approvedStoreOwner
    * @param storeOwner address
	*/
    function removeApprovedStoreOwner(address storeOwner) private onlyAdmin whenNotPaused{
        uint index = approvedStoreOwnersIndex[storeOwner];
        if (approvedStoreOwners.length > 1) {
            approvedStoreOwners[index] = approvedStoreOwners[approvedStoreOwners.length-1];
        }
        approvedStoreOwners.length--;
    }
    
}
pragma solidity 0.5.8;

import './OnlineMarket.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';

/*
* @title StoreFront 
*
* @dev This contract allows storeowners to manage their stores, add/remove products from store and buyers to buy the products
* 
*/
contract StoreFront is Ownable, Pausable{
    
    //OnlineMarket Instance
    OnlineMarket public onlineMarketInstance;
    

    /** @dev Constructor to link the Marketplace contract
	* @param onlineMarketContractAddress to link OnlineMarket contract
	*/
    constructor(address onlineMarketContractAddress) public {
        onlineMarketInstance = OnlineMarket(onlineMarketContractAddress);
    }
    
    /** @dev Struct that hold Stores data 
	* @param storeId Store Id
	* @param storeName Store name 
	* @param storeOwner address of the storeOwner
	* @param balance Store balance 
	*/
    struct Store {
        bytes32 storeId;
        string storeName;
        address storeOwner;
        uint balance;
    }
    
    /** @dev Struct that hold Products data 
	* @param productId ProductId
	* @param productName Product name 
	* @param description description of the Product
    * @param price price of the Product
	* @param quantity quantity of the product in a store
    * @param storeId Store Id
	*/
    struct Product {
        bytes32 productId;
        string productName;
        string description; 
        uint price;
        uint quantity;
        bytes32 storeId;
    }
    
    // Hold all the stores
    bytes32[] private  stores;
    // Hold mapping of the stores with index
    mapping(bytes32 => uint) private storesIndex;
        
     // Mapping Stores with StoreId
    mapping(bytes32 => Store) private storeById;
    
    // Mapping Store Owners with StoreIds
    mapping(address =>  bytes32[]) private storesByOwners;
    
    // Mapping Products by Products Id
    mapping(bytes32 => Product) private productsById;
    
    //Mapping of Product by Store
    mapping(bytes32 => bytes32[]) private productsByStore;

    //Events which are emitted at various points
    event LogStoreCreated(bytes32 storeId);
    event LogStoreRemoved(bytes32 storeId);
    event LogProductAdded(bytes32 productId);
    event LogProductRemoved (bytes32 productId,bytes32 storefrontId);
    event LogBalanceWithdrawn(bytes32 storeId, uint storeBalance);
    event LogPriceUpdated (bytes32 productId,uint oldPrice,uint newPrice);
    event LogProductSold(bytes32 productId, bytes32 storeId, uint price, uint buyerQty, uint amount, address buyer, uint remainingQuantity);
    
    // Modifier to to restrict function calls to only approved store owner
    modifier onlyApprovedStoreOwner() {
        require(onlineMarketInstance.checkStoreOwnerStatus(msg.sender) == true);
        _;
    }
    
    // Modifier to to restrict function calls to the store owner who created the store
    modifier onlyStoreOwner(bytes32 storeId) {
        require(storeById[storeId].storeOwner == msg.sender);
        _;
    }

    /** @dev Function is to create the store by approved store owner
	* @param storeName Name of the store
    * @return storeId
	*/
    function createStore(string memory storeName) public onlyApprovedStoreOwner whenNotPaused returns(bytes32){
        bytes32 storeId = keccak256(abi.encodePacked(msg.sender, storeName, now));
        Store memory store = Store(storeId, storeName, msg.sender, 0);
        storeById[storeId] = store;
        storesByOwners[msg.sender].push(store.storeId);
        stores.push(store.storeId);
        storesIndex[store.storeId] = stores.length-1;
        emit LogStoreCreated(store.storeId);
        return store.storeId;
    }
    
    /** @dev Function is to get all the stores
	* @param storeOwner address
    * @return storeIds - all the storeIds
	*/
    function getStores(address storeOwner) public view onlyApprovedStoreOwner returns(bytes32[] memory){
        return storesByOwners[storeOwner];
    }
    
    /** @dev Function is to get storeId by the store owner
	* @param storeOwner address
    * @param index Store owner index
    * @return storeId
	*/
    function getStoreIdByOwner(address storeOwner, uint index) public view returns(bytes32) {
        return storesByOwners[storeOwner][index];
    }

    /** @dev Function is to get stores count by the store owner
	* @param storeOwner address
    * @return no of stores
	*/
    function getStoreCountByOwner(address storeOwner) public view returns(uint){
        return storesByOwners[storeOwner].length;
    }
    
    /** @dev Function is to remove a store
	* @param storeId Id of the store
	*/
    function removeStore(bytes32 storeId) public onlyApprovedStoreOwner onlyStoreOwner(storeId) whenNotPaused {
        //Remove all products in the store;
        removeProducts(storeId);
        //remove store from stores array
        uint storeIndex = storesIndex[storeId];
        if (stores.length > 1) {
            stores[storeIndex] = stores[stores.length-1];
        }
        stores.length--;
        //remove store by Owner
        uint length = storesByOwners[msg.sender].length;
        for (uint i=0; i<length; i++) {
            if(storesByOwners[msg.sender][i] == storeId){
                if(i!=length-1){
                    storesByOwners[msg.sender][i] = storesByOwners[msg.sender][length-1];
                }
                delete storesByOwners[msg.sender][length-1];
                storesByOwners[msg.sender].length--;
                break;
            }
        }
        // Withdraw store balance and transfer to msg.sender
        uint storeBalance = storeById[storeId].balance;
		if (storeBalance > 0) {
			msg.sender.transfer(storeBalance);
			storeById[storeId].balance = 0;
			emit LogBalanceWithdrawn(storeId, storeBalance);
		}

        //Delete Store By Id
        delete storeById[storeId];
        emit LogStoreRemoved(storeId);
    }

    /** @dev Function is to withdraw the store balance
	* @param storeId Id of the store
	*/
    function withdrawStoreBalance(bytes32 storeId) public payable onlyApprovedStoreOwner onlyStoreOwner(storeId) whenNotPaused{
        require(storeById[storeId].balance > 0);
		uint storeBalance = storeById[storeId].balance;
		msg.sender.transfer(storeBalance);
		emit LogBalanceWithdrawn(storeId, storeBalance);
		storeById[storeId].balance = 0;
    }
    
    /** @dev Function is to get stores Id
	* @param index storeId index
    * @return storeId
	*/
    function getStoreId(uint index) public view returns(bytes32){
        return stores[index];
    } 
    
     /** @dev Function is to get store owner of the store
	* @param storeId Id of the store
    * @return storeOwner address
	*/
    function getStoreOwner(bytes32 storeId) public view returns(address){
        return storeById[storeId].storeOwner;
    }
    
    /** @dev Function is to get store name
	* @param storeId Id of the store
    * @return storeName
	*/
    function getStoreName(bytes32 storeId) public view returns(string memory){
        return storeById[storeId].storeName;
    }

     /** @dev Function is to get total store counts
    * @return totalStoreCount
	*/
    function getTotalStoresCount() view public returns (uint) {
		return stores.length;
	}

    /** @dev Function is to get store balance
    * @param storeId Id of the store
    * @return storeBalance
	*/
    function getStoreBalance(bytes32 storeId) public view onlyApprovedStoreOwner onlyStoreOwner(storeId) returns (uint) {
		return storeById[storeId].balance;
	}
    
     /** @dev Function is to add a Product to the store
    * @param storeId Id of the store
    * @param productName Name of the product
    * @param description Description of the product
    * @param price price of the product
    * @param quantity quantity of the product
    * @return productId
	*/
    function addProduct(bytes32 storeId, string memory productName, string memory description, uint price, uint quantity) 
    public onlyApprovedStoreOwner onlyStoreOwner(storeId) whenNotPaused returns(bytes32){
        bytes32 productId = keccak256(abi.encodePacked(storeId, productName, now));
        Product memory product = Product(productId, productName, description, price, quantity, storeId);
        productsById[productId] = product;
        productsByStore[storeId].push(product.productId);
        emit LogProductAdded(product.productId);
        return product.productId;
    }

     /** @dev Function is to update Product price of a store
    * @param storeId Id of the store
    * @param productId Id of the product
    * @param newPrice new price of the product
	*/
    function updateProductPrice(bytes32 storeId, bytes32 productId, uint newPrice) 
    public onlyStoreOwner(storeId) whenNotPaused {
		Product storage product = productsById[productId];
		uint oldPrice = product.price;
		productsById[productId].price = newPrice;
		emit LogPriceUpdated(productId, oldPrice, newPrice);
	}

    /** @dev Function is to get the price of the Product
    * @param productId Id of the product
    * @return price of the product
	*/
    function getProductPrice(bytes32 productId) public view returns (uint) {
		return productsById[productId].price;
	}

    /** @dev Function is to get the name of the Product
    * @param productId Id of the product
    * @return name of the product
	*/
    function getProductName(bytes32 productId) public view returns (string memory) {
		return productsById[productId].productName;
	}
    
    /** @dev Function is to get productIds in a store
    * @param storeId Id of the store
    * @return productIds in a store
	*/
    function getProductIdsByStore(bytes32 storeId) public view returns(bytes32[] memory){
        return productsByStore[storeId];
    }
    
    /** @dev Function is to get productId in a store
    * @param storeId Id of the store
    * @param index product Id index in a store
    * @return productId in a store
	*/
    function getProductIdByStore(bytes32 storeId, uint index) public view returns(bytes32){
        return productsByStore[storeId][index];
    }

    /** @dev Function is to get no of products in a store
    * @param storeId Id of the store
    * @return no of products in a store
	*/
    function getProductsCountByStore(bytes32 storeId) public view returns(uint){
        return productsByStore[storeId].length;
    }

    /** @dev Function is to get product by Id
    * @param productId Id of the product
    * @return productId Id of the product
    * @return productName Name of the product
    * @return description Description of the product
    * @return price price of the product
    * @return quantity quantity of the product
    * @return storeId Id of the store
	*/
    function getProductById(bytes32 productId) public view returns (string memory, string memory, uint, uint, bytes32){
        return (productsById[productId].productName, productsById[productId].description, productsById[productId].price, 
        productsById[productId].quantity, productsById[productId].storeId);
    }

    /** @dev Function is to remove products in a store.
    * @param storeId Id of the store
	*/
    function removeProducts(bytes32 storeId) public onlyApprovedStoreOwner onlyStoreOwner(storeId) whenNotPaused{
        for (uint i=0; i< productsByStore[storeId].length; i++) {
                bytes32 productId = productsByStore[storeId][i];
                delete productsByStore[storeId][i];
                delete productsById[productId];
        }
    }
    
    /** @dev Function is to remove product in a store.
    * @param storeId Id of the store
    * @param productId Id of the Product
	*/
    function removeProductByStore(bytes32 storeId, bytes32 productId) public onlyApprovedStoreOwner onlyStoreOwner(storeId) whenNotPaused{        
        bytes32[] memory productIds = productsByStore[storeId]; 
		uint productsCount = productIds.length; 
        for(uint i=0; i<productsCount; i++) {
			if (productIds[i] == productId) {
				productIds[i] = productIds[productsCount-1];
				delete productIds[productsCount-1];
                productsByStore[storeId] = productIds;
				delete productsById[productId];
				emit LogProductRemoved(productId, storeId);
				break;
			}
		}
    }
    
    /** @dev Function is to buy the products by the buyer
    * @param storeId Id of the store
    * @param productId Id of the Product
    * @param quantity quanities of the product to buy
    * @return true if product is bought otherwise false
	*/
    function buyProduct(bytes32 storeId, bytes32 productId, uint quantity) public payable whenNotPaused returns(bool){
        //store owner can not buy its own productsById
        Product storage prdct = productsById[productId];
        Store storage str = storeById[storeId];
        //store owner can not buy its own products
        require(str.storeOwner != msg.sender);
        uint amount =  prdct.price*quantity;
        require(msg.value >= amount);
        require (quantity <= prdct.quantity);
        
        //refund remaining fund back to buyer
        uint remainingValue = msg.value-amount;
        msg.sender.transfer(remainingValue);
        
        //update product quantity & store balance
        prdct.quantity-=quantity;
        str.balance+=amount;
        emit LogProductSold(productId, storeId, prdct.price, quantity, amount, msg.sender, prdct.quantity);
		return true;
    }
      
}
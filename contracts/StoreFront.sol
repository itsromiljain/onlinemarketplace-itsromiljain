pragma solidity >=0.4.0 <0.7.0;

import "./OnlineMarket.sol";

contract StoreFront {
    
    OnlineMarket onlineMarketInstance;
    
    constructor(address onlineMarketContractAddress) public {
        onlineMarketInstance = OnlineMarket(onlineMarketContractAddress);
    }
    
    struct Store {
        bytes32 storeId;
        string storeName;
        address storeOwner;
        uint balance;
    }
    
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
    mapping(bytes32 => uint) storesIndex;
        
     // Mapping Stores with StoreId
    mapping(bytes32 => Store) storeById;
    
    // Mapping Store Owners with StoreIds
    mapping(address =>  bytes32[]) storesByOwners;
    
    // Mapping Products by Products Id
    mapping(bytes32 => Product) productsById;
    
    //Mapping of Product by Store
    mapping(bytes32 => bytes32[]) productsByStore;

    event LogStoreCreated(bytes32 storeId);
    event LogStoreRemoved(bytes32 storeId);
    event LogProductAdded(bytes32 productId);
    event LogProductRemoved (bytes32 productId,bytes32 storefrontId);
    event LogBalanceWithdrawn(bytes32 storeId, uint storeBalance);
    event LogPriceUpdated (bytes32 productId,uint oldPrice,uint newPrice);
    
    // Only approved Store Owner can take action
    modifier onlyApprovedStoreOwner() {
        require(onlineMarketInstance.checkStoreOwnerStatus(msg.sender) == true);
        _;
    }
    
    // Store must be owned by Store Owner
    modifier onlyStoreOwner(bytes32 storeId) {
        require(storeById[storeId].storeOwner == msg.sender);
        _;
    }

    // Store can be created by approved Store Owners only
    function createStore(string memory storeName) public onlyApprovedStoreOwner returns(bytes32){
        bytes32 storeId = keccak256(abi.encodePacked(msg.sender, storeName, now));
        Store memory store = Store(storeId, storeName, msg.sender, 0);
        storeById[storeId] = store;
        storesByOwners[msg.sender].push(store.storeId);
        stores.push(store.storeId);
        storesIndex[store.storeId] = stores.length-1;
        emit LogStoreCreated(store.storeId);
        return store.storeId;
    }
    
    function getStores(address storeOwne) public view onlyApprovedStoreOwner returns(bytes32[] memory){
        return storesByOwners[storeOwne];
    }
    
    function getStoreIdByOwner(address storeOwner, uint index) public view returns(bytes32) {
        return storesByOwners[storeOwner][index];
    }

    function getStoreCountByOwner(address storeOwner) public view returns(uint){
        return storesByOwners[storeOwner].length;
    }
    
    function removeStore(bytes32 storeId) public onlyApprovedStoreOwner onlyStoreOwner(storeId) {
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
            if(storesByOwners[msg.sender][i] == storeId && i!=length-1){
                storesByOwners[msg.sender][i] = storesByOwners[msg.sender][length-1];
            }
            delete storesByOwners[msg.sender][length-1];
            storesByOwners[msg.sender].length--;
            break;
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

    function withdrawStoreBalance(bytes32 storeId) public payable onlyApprovedStoreOwner onlyStoreOwner(storeId) {
        require(storeById[storeId].balance > 0);
		uint storeBalance = storeById[storeId].balance;
		msg.sender.transfer(storeBalance);
		emit LogBalanceWithdrawn(storeId, storeBalance);
		storeById[storeId].balance = 0;
    }
    
    function getStoreId(uint index) public view returns(bytes32){
        return stores[index];
    } 
    
    function getStoreOwner(bytes32 storeId) public view returns(address){
        return storeById[storeId].storeOwner;
    }
    
    function getStoreName(bytes32 storeId) public view returns(string memory){
        return storeById[storeId].storeName;
    }

    function getTotalStoresCount() view public returns (uint) {
		return stores.length;
	}

    function getStoreBalance(bytes32 storeId) public view onlyApprovedStoreOwner onlyStoreOwner(storeId) returns (uint) {
		return storeById[storeId].balance;
	}
    
    function addProduct(bytes32 storeId, string memory productName, string memory description, uint price, uint quanity) 
    public onlyApprovedStoreOwner onlyStoreOwner(storeId) returns(bytes32){
        bytes32 productId = keccak256(abi.encodePacked(storeId, productName, now));
        Product memory product = Product(productId, productName, description, price, quanity, storeId);
        productsById[productId] = product;
        productsByStore[storeId].push(product.productId);
        emit LogProductAdded(product.productId);
        return product.productId;
    }

    function updateProductPrice(bytes32 storeId, bytes32 productId, uint newPrice) 
    public onlyStoreOwner(storeId) {
		Product storage product = productsById[productId];
		uint oldPrice = product.price;
		productsById[productId].price = newPrice;
		emit LogPriceUpdated(productId, oldPrice, newPrice);
	}

    function getProductPrice(bytes32 productId) public view returns (uint) {
		return productsById[productId].price;
	}

    function getProductName(bytes32 productId) public view returns (string memory) {
		return productsById[productId].productName;
	}
    
    function getProductIdsByStore(bytes32 storeId) public view returns(bytes32[] memory){
        return productsByStore[storeId];
    }
    
    function getProductIdByStore(bytes32 storeId, uint index) public view returns(bytes32){
        return productsByStore[storeId][index];
    }

    function getProductsCountByStore(bytes32 storeId) public view returns(uint){
        return productsByStore[storeId].length;
    }
    
    function getProductById(bytes32 productId) public view returns (string memory, string memory, uint, uint, bytes32){
        return (productsById[productId].productName, productsById[productId].description, productsById[productId].price, 
        productsById[productId].quantity, productsById[productId].storeId);
    }

    function removeProducts(bytes32 storeId) public onlyApprovedStoreOwner onlyStoreOwner(storeId){
        for (uint i=0; i< productsByStore[storeId].length; i++) {
                bytes32 productId = productsByStore[storeId][i];
                delete productsByStore[storeId][i];
                delete productsById[productId];
        }
    }
    
    function removeProductByStore(bytes32 storeId, bytes32 productId) public onlyApprovedStoreOwner onlyStoreOwner(storeId){        
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
    
    function buyProduct(bytes32 storeId, bytes32 productId, uint quantity) public payable{
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
    }
      
}
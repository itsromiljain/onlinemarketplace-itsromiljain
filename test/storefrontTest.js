let catchRevert = require("./exceptionsHelpers.js").catchRevert
var OnlineMarket = artifacts.require("OnlineMarket");
var StoreFront = artifacts.require("StoreFront");
const BN = web3.utils.BN;

contract ("StoreFront", accounts => {
    const owner = accounts[0];
    const admin1 = accounts[1];
    const admin2 = accounts[2];
    const storeOwner1 = accounts[3];
    const storeOwner2 = accounts[4];
    const storeOwner3 = accounts[5];
    const buyer1 = accounts[6];
    const buyer2 = accounts[7];

    let onlineMarketInstance;
    let storeFrontInstance;

    const store1 = {
        storeName: "Test Store 1"
    }

    const store2 = {
        storeName: "Test Store 2"
    }

    const store3 = {
        storeName: "Test Store 3"
    }

    const store4 = {
        storeName: "Test Store 4"
    }

    const product1 = {
        productName: "Product 1",
        description: "Description 1",
        price:10,
        quantity:100
    }

    const product2 = {
        productName: "Product 2",
        description: "Description 2",
        price:12,
        quantity:150
    }

    const product3 = {
        productName: "Product 3",
        description: "Description 3",
        price:15,
        quantity:200
    }
    // Define beforeEach
    beforeEach(async() => {
        onlineMarketInstance = await OnlineMarket.new();
        storeFrontInstance = await StoreFront.new(onlineMarketInstance.address);
        //await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
    });

    describe("Functions", () => {
        describe("CreateStore()", async() =>{
            it("Create Store by approved store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const tx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const returnedStoreId = tx.logs[0].args.storeId;
                const expectedStoreId = await storeFrontInstance.getStoreIdByOwner(0, {from:storeOwner1});
                assert.equal(returnedStoreId, expectedStoreId, "Store should be created");
                const storeCount = await storeFrontInstance.getStoreCountByOwner(storeOwner1, {from:storeOwner1});
                assert.equal(storeCount, 1, "Store count should match");
            });

            it("Create Multiple Store by approved store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                await storeFrontInstance.createStore(store2.storeName, {from:storeOwner1});
                await storeFrontInstance.createStore(store4.storeName, {from:storeOwner1});
                const storeCount = await storeFrontInstance.getStoreCountByOwner(storeOwner1, {from:storeOwner1});
                assert.equal(storeCount, 3, "Store count should match");
            });
        
            it("Stores can only be created by approved store owner otherwise revert", async() => {
                 await catchRevert(storeFrontInstance.createStore(store2.storeName, {from:storeOwner2}));
            });
        
            it("Create Store by approved store owner and check Store Owner and Name", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner3, {from:owner});
                const tx = await storeFrontInstance.createStore(store3.storeName, {from:storeOwner3});
                const storeId = tx.logs[0].args.storeId;
                const returnedStoreOwner = await storeFrontInstance.getStoreOwner(storeId, {from:storeOwner3});
                assert.equal(returnedStoreOwner, storeOwner3, "Store Owner should  match");
                const returnedStoreName = await storeFrontInstance.getStoreName(storeId, {from:storeOwner3});
                assert.equal(returnedStoreName, store3.storeName, "Store Name should  match");     
            });
        })

        describe("AddProduct()", async() =>{
            it("Add product to store created by approved store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                const prodTx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1}); 
                returnProductId = prodTx.logs[0].args.productId;
                const extpectProductId = await storeFrontInstance.getProductIdByStore(storeId, 0, {from:storeOwner1});
                assert.equal(returnProductId, extpectProductId, "Product should be added");
                const prodDetail = await storeFrontInstance.getProductById(returnProductId, {from:storeOwner1});
                assert.equal(prodDetail[0].toString(), product1.productName, "Product Name should match");
                assert.equal(prodDetail[1].toString(), product1.description, "Product Description should match");
                assert.equal(prodDetail[2].toNumber(), product1.price, "Product Price should match");
                assert.equal(prodDetail[3].toNumber(), product1.quantity, "Product Quantity should match");
            })
            it("Add Multiple products to store created by approved store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId;
                const prodTx1 = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1});
                const returnProductId1 = prodTx1.logs[0].args.productId;
                const prodTx2 = await storeFrontInstance.addProduct(storeId,product2.productName, product2.description, 
                    product2.price, product2.quantity,{from:storeOwner1});
                const returnProductId2 = prodTx2.logs[0].args.productId;
                const prodTx3 = await storeFrontInstance.addProduct(storeId,product3.productName, product3.description, 
                    product3.price, product3.quantity,{from:storeOwner1});
                const returnProductId3 = prodTx3.logs[0].args.productId;
                const productArr = await storeFrontInstance.getProductIdsByStore(storeId, {from:storeOwner1});
                assert.equal(returnProductId1, productArr[0], "ProductId 1 should match");
                assert.equal(returnProductId2, productArr[1], "ProductId 2 should match");
                assert.equal(returnProductId3, productArr[2], "ProductId 3 should match");
            })   
        })

        describe("Exceptions()", async() =>{
            it("Revert If Product is added to the store not created by the store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                await onlineMarketInstance.approveStoreOwners(storeOwner2, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                await catchRevert(storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner2}));
            })

            it("Revert If product is removed from the store not created by the store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                await onlineMarketInstance.approveStoreOwners(storeOwner2, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1});
                // Store Owner 2 tried to remove the product from the store which is created by Store Owner 1
                await catchRevert(storeFrontInstance.removeProductByStore(storeId, 0, {from:storeOwner2}));
            })

        })

        describe("RemoveProducts()", async() =>{           
            it("Remove product Id from a store created by approved store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId;
                await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1});
                await storeFrontInstance.addProduct(storeId,product2.productName, product2.description, 
                    product2.price, product2.quantity,{from:storeOwner1});
                await storeFrontInstance.removeProductByStore(storeId, 0, {from:storeOwner1});
                const productCount = await storeFrontInstance.getProductsCountByStore.call(storeId);
                //console.log(productCount.toNumber());
                let finalCount = productCount.toNumber();
                for(let i=0; i<productCount; i++) {
			        let id = await storeFrontInstance.getProductIdByStore(storeId, i);
			        if (id == 0x0000000000000000000000000000000000000000000000000000000000000000)
				    finalCount -= 1;
		        }
                //console.log(finalCount);
                assert.equal(finalCount, 1, "product count should match");
            })
            it("Remove products from a store created by approved store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId;
                await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1});
                await storeFrontInstance.addProduct(storeId,product2.productName, product2.description, 
                    product2.price, product2.quantity,{from:storeOwner1});
                await storeFrontInstance.addProduct(storeId,product3.productName, product3.description, 
                    product3.price, product3.quantity,{from:storeOwner1});
                await storeFrontInstance.removeProducts(storeId, {from:storeOwner1});
                const productCount = await storeFrontInstance.getProductsCountByStore.call(storeId);
                //console.log(productCount.toNumber());
                let finalCount = productCount.toNumber();
                for(let i=0; i<productCount; i++) {
			        let id = await storeFrontInstance.getProductIdByStore(storeId, i);
			        if (id == 0x0000000000000000000000000000000000000000000000000000000000000000)
				    finalCount -= 1;
		        }
                //console.log(finalCount);
                assert.equal(finalCount, 0, "All products should be deleted");
            })
        })

        describe("RemoveStore()", async() =>{
            
        })

        

        describe("BuyProducts()", async() =>{

        })

    })
});
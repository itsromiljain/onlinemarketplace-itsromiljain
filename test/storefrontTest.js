let catchRevert = require("./exceptionsHelpers.js").catchRevert
var OnlineMarket = artifacts.require("OnlineMarket");
var StoreFront = artifacts.require("StoreFront");

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

    // Define beforeEach
    beforeEach(async() => {
        onlineMarketInstance = await OnlineMarket.new();
        storeFrontInstance = await StoreFront.new(onlineMarketInstance.address);
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
                 await catchRevert(storeFrontInstance.createStore("Amazon", {from:storeOwner2}));
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
            await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
            await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
            
        })

        describe("RemoveStore()", async() =>{

        })

        describe("RemoveProducts()", async() =>{

        })

        describe("BuyProducts()", async() =>{

        })

    })
});
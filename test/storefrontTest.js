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
    const buyer3 = accounts[8];

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
                const expectedStoreId = await storeFrontInstance.getStoreIdByOwner(storeOwner1, 0, {from:storeOwner1});
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
                const returnProductId = prodTx.logs[0].args.productId;
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
            it("Stores can only be created by approved store owner otherwise revert", async() => {
                await catchRevert(storeFrontInstance.createStore(store2.storeName, {from:storeOwner2}));
            });
            it("Revert If store is removed by the owner who didn't create the store", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                await onlineMarketInstance.approveStoreOwners(storeOwner2, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                // Store Owner 2 tried to remove the product from the store which is created by Store Owner 1
                await catchRevert(storeFrontInstance.removeStore(storeId,{from:storeOwner2}));
            })

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
                const prodTx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1});
                const productId = prodTx.logs[0].args.productId;
                // Store Owner 2 tried to remove the product from the store which is created by Store Owner 1
                await catchRevert(storeFrontInstance.removeProductByStore(storeId, productId, {from:storeOwner2}));
            })

            it("Revert if other StoreFront owners try to withdraw some other storefront's balance", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                await onlineMarketInstance.approveStoreOwners(storeOwner2, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                const prodTx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1}); 
                const productId = prodTx.logs[0].args.productId;
                await storeFrontInstance.buyProduct(storeId, productId, 20, {from: buyer1, value: (product1.price)*20});
               
                await catchRevert(storeFrontInstance.withdrawStoreBalance(storeId, {from:storeOwner2}));
            })

        })

        describe("RemoveProducts()", async() =>{           
            it("Remove product Id from a store created by approved store owner", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId;
                const prod1Tx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1});
                const productId1 = prod1Tx.logs[0].args.productId;
                await storeFrontInstance.addProduct(storeId,product2.productName, product2.description, 
                    product2.price, product2.quantity,{from:storeOwner1});
                await storeFrontInstance.removeProductByStore(storeId, productId1, {from:storeOwner1});
                const prods = await storeFrontInstance.getProductIdsByStore(storeId, {from:storeOwner1});
                const productCount = await storeFrontInstance.getProductsCountByStore.call(storeId);
                let finalCount = productCount.toNumber();
                for(let i=0; i<productCount; i++) {
			        let id = await storeFrontInstance.getProductIdByStore(storeId, i);
			        if (id == 0x0000000000000000000000000000000000000000000000000000000000000000)
				    finalCount -= 1;
		        }
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
            it("Remove Store created by approved store owner", async() => {
            await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
            const storeTx1 = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
            const storeId1 = storeTx1.logs[0].args.storeId;
            await storeFrontInstance.addProduct(storeId1,product1.productName, product1.description, 
                product1.price, product1.quantity,{from:storeOwner1});
            await storeFrontInstance.addProduct(storeId1,product2.productName, product2.description, 
                product2.price, product2.quantity,{from:storeOwner1});
            const storeTx2 = await storeFrontInstance.createStore(store2.storeName, {from:storeOwner1});
            const storeId2 = storeTx2.logs[0].args.storeId;
            await storeFrontInstance.addProduct(storeId2,product3.productName, product3.description, 
                product3.price, product3.quantity,{from:storeOwner1});
            await storeFrontInstance.removeStore(storeId1, {from:storeOwner1});
            const storesCount = await storeFrontInstance.getStoreCountByOwner.call(storeOwner1);
            //console.log("StoreCount from test->"+storesCount);
            let finalCount = storesCount.toNumber();
            for(let i=0; i<storesCount; i++) {
			    let id = await storeFrontInstance.getStoreIdByOwner(storeOwner1, i, {from:storeOwner1});
			    if (id == 0x0000000000000000000000000000000000000000000000000000000000000000)
				finalCount -= 1;
		    }
            assert.equal(finalCount, 1, "Store should be deleted");
            })
        })

        describe("BuyProducts()", async() =>{
            it("Buyers should be allowed to purchase a product if they pay its price", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                const prodTx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1}); 
                const productId = prodTx.logs[0].args.productId;
                const prePurchaseAmount = await web3.eth.getBalance(buyer1);
                //Buyer wants to buy 50 
                const buyerQuantity = 50;
                const buyerValue = (product1.price)*buyerQuantity;
                const buyReceipt = await storeFrontInstance.buyProduct(storeId, productId, buyerQuantity, {from: buyer1, value: buyerValue});
                const postPurchaseAmount = await web3.eth.getBalance(buyer1);
                const buyTx = await web3.eth.getTransaction(buyReceipt.tx);
                let buyTxCost = Number(buyTx.gasPrice) * buyReceipt.receipt.gasUsed;
                assert.equal(postPurchaseAmount, (new BN(prePurchaseAmount).sub(new BN(buyTxCost)).sub(new BN(buyerValue))).toString(), "Value should be deducted from Buyer's account");
                
                const product = await storeFrontInstance.getProductById(productId);
                assert.equal(product[3].toNumber(), product1.quantity-buyerQuantity, "Remaining Quantity of the product should match");       
            })
            it("Buyers should be allowed to purchase multiple products if they pay the total price", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                const prodTx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1}); 
                const productId1 = prodTx.logs[0].args.productId;
                const prodTx2 = await storeFrontInstance.addProduct(storeId,product2.productName, product2.description, 
                    product2.price, product2.quantity,{from:storeOwner1});
                const productId2 = prodTx2.logs[0].args.productId;
                const prePurchaseAmount = await web3.eth.getBalance(buyer1);
                //Buyer wants to buy 50 quantity of Product 1 and 60 quantity of Product 2
                const buyerPrdct1Quantity = 50;
                const buyerPrdct2Quantity = 60;
                const buyerProd1Value = (product1.price)*buyerPrdct1Quantity;
                const buyerProd2Value = (product2.price)*buyerPrdct2Quantity;

                const buyReceipt1 = await storeFrontInstance.buyProduct(storeId, productId1, buyerPrdct1Quantity, {from: buyer1, value: buyerProd1Value});
                const buyReceipt2 = await storeFrontInstance.buyProduct(storeId, productId2, buyerPrdct2Quantity, {from: buyer1, value: buyerProd2Value});

                const postPurchaseAmount = await web3.eth.getBalance(buyer1);

                const buyTx1 = await web3.eth.getTransaction(buyReceipt1.tx);
                let buyTxCost1 = Number(buyTx1.gasPrice) * buyReceipt1.receipt.gasUsed;

                const buyTx2 = await web3.eth.getTransaction(buyReceipt2.tx);
                let buyTxCost2 = Number(buyTx2.gasPrice) * buyReceipt2.receipt.gasUsed;
                assert.equal(postPurchaseAmount, (new BN(prePurchaseAmount).sub(new BN(buyTxCost1)).sub(new BN(buyTxCost2)).sub(new BN(buyerProd1Value)).sub(new BN(buyerProd2Value))).toString(), 
                    "Total Value should be deducted from Buyer's account");

                const returnProduct1 = await storeFrontInstance.getProductById(productId1);
                assert.equal(returnProduct1[3].toNumber(), product1.quantity-buyerPrdct1Quantity, "Remaining Quantity of the product 1 should match");  

                const returnProduct2 = await storeFrontInstance.getProductById(productId2);
                assert.equal(returnProduct2[3].toNumber(), product2.quantity-buyerPrdct2Quantity, "Remaining Quantity of the product 2 should match");  

            })
            it("Buyers should get refund if they pay more than the total", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                const prodTx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1}); 
                const productId = prodTx.logs[0].args.productId;
                const prePurchaseAmount = await web3.eth.getBalance(buyer1);
                //Buyer wants to buy 50 
                const buyerQuantity = 50;
                const buyerValue = 600;
                const actualValue = (product1.price)*buyerQuantity;
                const buyReceipt = await storeFrontInstance.buyProduct(storeId, productId, buyerQuantity, {from: buyer1, value: buyerValue});
                const postPurchaseAmount = await web3.eth.getBalance(buyer1);
                
                const buyTx = await web3.eth.getTransaction(buyReceipt.tx);
                let buyTxCost = Number(buyTx.gasPrice) * buyReceipt.receipt.gasUsed;
                assert.equal(postPurchaseAmount, (new BN(prePurchaseAmount).sub(new BN(buyTxCost)).sub(new BN(actualValue))).toString(), "Buyer should get the refund amount");
            })
            it("StoreFront owners should be allowed to withdraw their storefront's balance", async() => {
                await onlineMarketInstance.approveStoreOwners(storeOwner1, {from:owner});
                const storeTx = await storeFrontInstance.createStore(store1.storeName, {from:storeOwner1});
                const storeId = storeTx.logs[0].args.storeId; 
                const prodTx = await storeFrontInstance.addProduct(storeId,product1.productName, product1.description, 
                    product1.price, product1.quantity,{from:storeOwner1}); 
                const productId = prodTx.logs[0].args.productId;
                await storeFrontInstance.buyProduct(storeId, productId, 20, {from: buyer1, value: (product1.price)*20});
                await storeFrontInstance.buyProduct(storeId, productId, 10, {from: buyer2, value: (product1.price)*10});
                await storeFrontInstance.buyProduct(storeId, productId, 5, {from: buyer3, value: (product1.price)*5});
                const expectedBalance = (product1.price)*35;
                const returnedBalance = await storeFrontInstance.getStoreBalance(storeId, {from:storeOwner1});
                assert.equal(expectedBalance, returnedBalance, "Balance of the store should match"); 
                await storeFrontInstance.withdrawStoreBalance(storeId, {from:storeOwner1});
                const returnedStoreBalance = await storeFrontInstance.getStoreBalance(storeId, {from:storeOwner1});
                assert.equal(returnedStoreBalance, 0, "Balance should be 0 after withdrawl");
                /*const storeOwnerPreBalance = await web3.eth.getBalance(storeOwner1);
                console.log(storeOwnerPreBalance);
                const txReceipt = await storeFrontInstance.withdrawStoreBalance(storeId, {from:storeOwner1});
                const storeOwnerPostBalance = await web3.eth.getBalance(buyer1);
                console.log(storeOwnerPostBalance)
                const tx = await web3.eth.getTransaction(txReceipt.tx);
                let txCost = Number(tx.gasPrice) * txReceipt.receipt.gasUsed;
                console.log(txCost)
                console.log((storeOwnerPostBalance-storeOwnerPreBalance-txCost).toString());
                console.log((new BN(storeOwnerPostBalance).sub(new BN(storeOwnerPreBalance).sub(new BN(txCost)))).toString());
                //assert.equal(storeOwnerPostBalance, (new BN(storeOwnerPreBalance).sub(new BN(txCost))).toString(), "Available Balance should match");*/

            })
        })

    })
});
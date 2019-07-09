// Helper methods to get account balances
const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );

const getBalance = (account, at) =>
  promisify(cb => web3.eth.getBalance(account, at, cb));

App = {
  web3Provider: null,
  contracts: {},
  storeId: null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 != 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.when(
      $.getJSON('OnlineMarket.json', function(data) {
        var OnlineMarketArtifact = data;
        App.contracts.OnlineMarket = TruffleContract(OnlineMarketArtifact);
        App.contracts.OnlineMarket.setProvider(App.web3Provider);
      }),

      $.getJSON('StoreFront.json', function(data) {
        var StoreFrontArtifact = data;
        App.contracts.StoreFront = TruffleContract(StoreFrontArtifact);
        App.contracts.StoreFront.setProvider(App.web3Provider);
      })
    ).then(function() {

      // Get storefront ID from URL
      var vars = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
      });
      App.storeId = vars["id"]; 

      return App.checkStoreOwner();
    });
  },

  checkStoreOwner: function() {
    web3.eth.getAccounts(async function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      $('#currentAddress').text(account);

      let StoreFrontInstance = await App.contracts.StoreFront.deployed();
      let storeOwnerAddress = await StoreFrontInstance.getStoreOwner(App.storeId);

      if (account === storeOwnerAddress) {
        return App.storeOwnerView();
      } else {
        return App.defaultView();
      }
    });
  },

  storeOwnerView: function() {
    $('#storeOwnerView').attr('style', '');
    $('#defaultView').attr('style', 'display: none;');
    App.addProduct();
    App.productListView();
  },

  // View setup functions
  defaultView: function() {
    $('#storeOwnerView').attr('style', 'display: none;');
    App.productListView();
  },

  addProduct: function() {
    var StoreFrontInstance;

    $('#addProduct').submit(function( event ) {
      let name = $("input#productName").val();
      let desc = $("input#productDesc").val();
      let price = $("input#productPrice").val();
      let qty = $("input#productQty").val();

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.StoreFront.deployed().then(function(instance) {
          StoreFrontInstance = instance;
          return StoreFrontInstance.addProduct(
            App.storeId,
            name,
            desc,
            web3.toWei(Number(price)),
            Number(qty), {from: account});
        });
      });
      event.preventDefault();
    });
  },

  productListView: async function(e) {
    var productsDiv = $('#products');
    var productTemplate = $('#productTemplate'); 
    var productUpdateForm = $('.updateProduct');
    var productRemoveForm = $('.removeProduct');
    var productPurchaseForm = $('#buyProduct');

    let accounts = web3.eth.accounts;
    let account = accounts[0];
    let StoreFrontInstance = await App.contracts.StoreFront.deployed();
    
    let storeName = await StoreFrontInstance.getStoreName(App.storeId);
    document.getElementById("pageTitle").innerHTML = storeName;
    document.title = storeName;

    let productsLength = await StoreFrontInstance.getProductsCountByStore(App.storeId);
    let productIds = await App.getProducts(Number(productsLength), account);

    let storeOwnerAddress = await StoreFrontInstance.getStoreOwner(App.storeId);

    for(i=0; i<productIds.length; i++) {
      let product = await StoreFrontInstance.getProductById(productIds[i]);
      productTemplate.find('#productName').text(product[0]);
      productTemplate.find('#productDesc').text(product[1]);
      productTemplate.find('#productPrice').text(web3.fromWei(Number(product[2])));
      productTemplate.find('#productQuantity').text(Number(product[3]));
      productTemplate.find('#productID').text(productIds[i]);

      // Different buttons for storeowners vs. purchasers 
      if (storeOwnerAddress === account) {
        // Updating Price 
        productUpdateForm.attr('style', '');
        productUpdateForm.find('#productID').attr("value", productIds[i]);

        // Removing Products 
        productRemoveForm.attr('style', '');
        productRemoveForm.find('#productID').attr("value", productIds[i]);
      } else {
        // Purchasing Products 
        productPurchaseForm.attr('style', '');
        productPurchaseForm.find('#purchaseQty').attr("max", Number(product[3]));
        productPurchaseForm.find('#productID').attr("value", productIds[i]);
        productPurchaseForm.find('#purchasePrice').attr("value", web3.fromWei(Number(product[2])));
      }
      productsDiv.append(productTemplate.html());
    }
    App.buyProduct();
    App.updateProductPrice();
    App.removeProduct();
  },

  buyProduct: function() {
    var StoreFrontInstance;

    $('#buyProduct').submit(function( event ) {
      let qty = $(this).closest("form").find("input[name='qty']").val();
      let id = $(this).closest("form").find("input[name='id']").val();
      let price = $(this).closest("form").find("input[name='price']").val();

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.StoreFront.deployed().then(function(instance) {
          StoreFrontInstance = instance;
          return StoreFrontInstance.buyProduct(
            App.storeId,
            id,
            qty, {from: account, value: web3.toWei(qty*price)});
        });
      });
      event.preventDefault();
    });
  },

  updateProductPrice: function() {
    $('.updateProduct').submit(function( event ) {
      let id = $(this).closest("form").find("input[name='id']").val();
      let price = $(this).closest("form").find("input[name='price']").val();

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.StoreFront.deployed().then(function(instance) {
          StoreFrontInstance = instance;
          return StoreFrontInstance.updateProductPrice(
            App.storeId,
            id,
            web3.toWei(price), {from: account});
        });
      });
      event.preventDefault();
    });
  },

  removeProduct: function() {
    $('.removeProduct').submit(function( event ) {
      let productId = $(this).closest("form").find("input[name='id']").val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.StoreFront.deployed().then(function(instance) {
          StoreFrontInstance = instance;
          return StoreFrontInstance.removeProductByStore(App.storeId, productId, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  getProducts: async function(length, account) {
    let productIds = [];
    let StoreFrontInstance = await App.contracts.StoreFront.deployed();

    for(i=0; i<length; i++) {
      let sf = await StoreFrontInstance.getProductIdByStore(App.storeId, i);
      if (sf != 0x0000000000000000000000000000000000000000000000000000000000000000)
      productIds.push(sf);
    }

    // Remove duplicates
    let s = new Set(productIds);
    let vals = s.values();
    return Array.from(vals); 
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
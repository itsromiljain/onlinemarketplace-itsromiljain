App = {
  web3Provider: null,
  contracts: {},

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
      return App.checkAdmin();
    });
  },

  // Status validation functions
  checkAdmin: function() {
    var OnlineMarketInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      $('#currentAddress').text(account);

      App.contracts.OnlineMarket.deployed().then(function(instance) {
        OnlineMarketInstance = instance;
        return OnlineMarketInstance.checkAdmin(account);
      }).then(function(isAdmin) {
        if (isAdmin) {
          return App.adminView();
        } else {
          return App.checkStoreOwner();
        }
      });
    });
  },

  adminView: function() {
    document.getElementById("pageTitle").innerHTML = "Admin View"
    $('#adminView').attr('style', '');
    $('#storeOwnerView').attr('style', 'display: none;');
    $('#defaultView').attr('style', 'display: none;');

    // Configure forms and buttons 
    App.removeStoreOwner();
    App.addAdmin();
    App.removeAdmin();
    return App.requesterListView();
  },

  checkStoreOwner: function() {
    var OnlineMarketInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.OnlineMarket.deployed().then(function(instance) {
        OnlineMarketInstance = instance;
        return OnlineMarketInstance.checkStoreOwnerStatus(account);
      }).then(function(isOwner) {
        if (isOwner) {
          return App.storeOwnerView();
        } else {
          return App.defaultView();
        }
      });
    });
  },

  storeOwnerView: function() {
    document.getElementById("pageTitle").innerHTML = "Store Front Owner View"
    $('#storeOwnerView').attr('style', '');
    $('#adminView').attr('style', 'display: none;');
    $('#defaultView').attr('style', 'display: none;');
    App.createStore();
    App.deleteStore();
    App.storesListView().then( function() {
      App.withdrawStoreBalance();
    });
  },

  // View setup functions
  defaultView: function() {
    $('#defaultView').attr('style', '');
    $('#adminView').attr('style', 'display: none;');
    $('#storeOwnerView').attr('style', 'display: none;');

    web3.eth.getAccounts(async function(error, accounts) {
      if (error) {
        console.log(error);
      }

      $('.btn-request-store').attr('data-addr', accounts[0]);
      $('.btn-request-store').attr('style', '');


      let StoreFrontInstance = await App.contracts.StoreFront.deployed();
      let length = await StoreFrontInstance.getTotalStoresCount();
      length = Number(length);

      let storefrontListDiv = $('#storefrontList');
      let storefrontTemplate = $('#storefrontListItem');
      for(let i=0; i<length; i++) {
        let storeId = await StoreFrontInstance.getStoreId(i);
        let name = await StoreFrontInstance.getStoreName(storeId);
        storefrontTemplate.find('#storefrontListItemName').text(name);
        storefrontTemplate.find('#storefrontListItemName').attr('href', "/storefront.html?id=" + storeId);
        storefrontListDiv.append(storefrontTemplate.html());
      }
    });


    $('.btn-request-store').attr('data-addr', "test");
    $(document).on('click', '.btn-request-store', App.addStoreOwner);
  },

  requesterListView: function() {
    var marketplaceDiv = $('#marketplace');
    var requesterTemplate = $('#requesterTemplate'); 
    var approveButton = $('.btn-approve-requester');
    var OnlineMarketInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.OnlineMarket.deployed().then(function(instance) {
        OnlineMarketInstance = instance;
        return OnlineMarketInstance.getRequestedStoreOwnersLength();
      }).then(function(length) {
        return App.getRequesters(length);
      }).then(function(requesters) {
        for(i=0; i<requesters.length; i++) {
          requesterTemplate.find('.requesterAddress').text(requesters[i]);
          approveButton.attr('data-addr', requesters[i]);
          marketplaceDiv.append(requesterTemplate.html());
          $(document).on('click', '.btn-approve-requester', App.approveRequester);
        }
      })
    });
  },

  // Marketplace functions
  addStoreOwner: function(event) {
    var requesterAddr = $(event.target).data('addr');
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      var OnlineMarketInstance;
      App.contracts.OnlineMarket.deployed().then(function(instance) {
        OnlineMarketInstance = instance;
        return OnlineMarketInstance.addStoreOwner({from: account});
      }).then(function(){
        $(event.target).text('Request sent').attr('disabled', true);
      });
    });
  },

  removeStoreOwner: function() {
    var addr;
    var OnlineMarketInstance;

    $('#removeStoreOwner').submit(function( event ) {
      addr = $( "input:first" ).val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.OnlineMarket.deployed().then(function(instance) {
          OnlineMarketInstance = instance;
          return OnlineMarketInstance.removeStoreOwner(addr, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  addAdmin: function() {
    let addr;
    var OnlineMarketInstance;

    $('#addAdmin').submit(function( event ) {
      addr = $("input#adminAddrAdd").val();
      console.log(addr);
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];
        App.contracts.OnlineMarket.deployed().then(function(instance) {
          OnlineMarketInstance = instance;
          console.log(addr)
          return OnlineMarketInstance.addAdmin(addr, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  removeAdmin: function() {
    var addr;
    var OnlineMarketInstance;

    $('#removeAdmin').submit(function( event ) {
      addr = $( "input#adminAddrRem" ).val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.OnlineMarket.deployed().then(function(instance) {
          OnlineMarketInstance = instance;
          return OnlineMarketInstance.removeAdmin(addr, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  // Some of the validation that's being done here should maybe 
  // be done in Marketplace.sol instead 
  getRequesters: async function(length) {
    let requesters = [];
    let OnlineMarketInstance = await App.contracts.OnlineMarket.deployed();

    for(i=0; i<length; i++) {
      let requester = await OnlineMarketInstance.viewRequestedStoreOwner(i);
      // Check if a requester is already a store owner. Only add to array if not.
      let isStoreOwner = await OnlineMarketInstance.checkStoreOwnerStatus(requester);
      if (!isStoreOwner) {
        requesters.push(requester);
      }
    }

    // Remove duplicates 
    let s = new Set(requesters);
    let vals = s.values();
    return Array.from(vals);
  },

  approveRequester: function(event) {
    var requesterAddr = $(event.target).data('addr');
    var OnlineMarketInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.OnlineMarket.deployed().then(function(instance) {
        OnlineMarketInstance = instance;
        return OnlineMarketInstance.approveStoreOwners(requesterAddr, {from: account});
      }).then(function() {
        $(event.target).text('Approved!').attr('disabled', true);
      })
    });
  },

  // Storefront functions 
  createStore: function() {
    let name;
    var StoresFrontInstance;

    $('#createStorefront').submit(function( event ) {
      name = $("input#storefrontName").val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.StoreFront.deployed().then(function(instance) {
          StoresFrontInstance = instance;
          return StoresFrontInstance.createStore(name, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  deleteStore: function() {
    let storeId;
    var StoresFrontInstance;

    $('#deleteStorefront').submit(function( event ) {
      storeId = $("input#storefrontId").val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.StoreFront.deployed().then(function(instance) {
          StoresFrontInstance = instance;
          return StoresFrontInstance.removeStore(storeId, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  storesListView: async function(e) {
    var storefrontsDiv = $('#storefronts');
    var storefrontTemplate = $('#storefrontTemplate'); 
    var withdrawForm = $('.wf');

    let accounts = web3.eth.accounts;
    let account = accounts[0];
    let StoresFrontInstance = await App.contracts.StoreFront.deployed();
    let storesLength = await StoresFrontInstance.getStoreCountByOwner(account);
    let stores = await App.getStores(Number(storesLength), account);
    for(i=0; i<stores.length; i++) {
      let storeBalance = await StoresFrontInstance.getStoreBalance(stores[i]);
      let storeName = await StoresFrontInstance.getStoreName(stores[i]);
      storefrontTemplate.find('#storefrontId').text(stores[i]);
      storefrontTemplate.find('#storefrontBalance').text(web3.fromWei(storeBalance));
      storefrontTemplate.find('#storefrontLink').text(storeName);
      storefrontTemplate.find('#storefrontLink').attr('href', "/storefront.html?id=" + stores[i]);
      withdrawForm.find('#storefrontId').attr("value", stores[i]);
      storefrontsDiv.append(storefrontTemplate.html());
    }
  },

  getStores: async function(length, account) {
    let stores = [];
    let StoresFrontInstance = await App.contracts.StoreFront.deployed();

    for(i=0; i<length; i++) {
      let sf = await StoresFrontInstance.getStoreIdByOwner(account, i);
      if (sf != 0x0000000000000000000000000000000000000000000000000000000000000000)
      stores.push(sf);
    }

    // Remove duplicates, if any
    let s = new Set(stores);
    let vals = s.values();
    return Array.from(vals); 
  },

  withdrawStoreBalance: function() {
    var StoreFrontInstance;

    $('.wf').click(function(event) {
      let storeId = $(this).closest("form").find("input[name='ID']").val();
      // let id = $("input#storefrontId").val();
      console.log(storeId);

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];
        App.contracts.StoreFront.deployed().then(function(instance) {
          StoreFrontInstance = instance;
          return StoreFrontInstance.withdrawStoreBalance(storeId, {from: account});
        });
      });
      event.preventDefault();
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
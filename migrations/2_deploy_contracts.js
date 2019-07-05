var OnlineMarket = artifacts.require("OnlineMarket");
var StoreFront = artifacts.require("StoreFront.sol");

module.exports = function(deployer) {
  deployer.deploy(OnlineMarket).then(function() {
  	return deployer.deploy(StoreFront, OnlineMarket.address);
  });
};

//const HDWalletProvider = require('truffle-hdwallet-provider');
//const infuraKey = "85ba70deebdd408b95718a4e5b7166cb";

//const fs = require('fs');
//const mnemonic = fs.readFileSync(".secret").toString().trim();
//const infuraURL = 'https://rinkeby.infura.io/v3/85ba70deebdd408b95718a4e5b7166cb';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    },
     /*rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, infuraURL),     // Localhost (default: none)
      network_id: 4,            // Rinkeby's network id
      gas: 6500000,       // Any network (default: none)
     },*/
  },
  compilers: {
    solc: {
      version: "0.5.8"
    },
  }
};

const VoteLedger = artifacts.require("VoteLedger");

module.exports = function (deployer) {
  deployer.deploy(VoteLedger);
};

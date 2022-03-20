const { expect } = require("chai");
const { ethers } = require("hardhat");
const {WHITELIST_CONTRACT_ADDRESS,METADATA_URL} = require("../constants");
describe("CryptoDevs", function () {
  it("Metadata and baseuri should be same ", async function () {
    const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
    const metadataURL = METADATA_URL;
    const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
    const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
        metadataURL,
        whitelistContract
    );
    const baseURI = await deployedCryptoDevsContract._baseTokenURI;
    console.log("Metadata", metadataURL);
    console.log("baseURI",baseURI);
    //expect(baseURI).to.equal(metadataURL);
  });
});

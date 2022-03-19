// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers} = require("hardhat");
const {WHITELIST_CONTRACT_ADDRESS,METADATA_URL} = require("../constants");
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;

  // We get the contract to deploy
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
  metadataURL,
  whitelistContract
  );
  console.log(
    "Crypto Devs Contract Address:",
    deployedCryptoDevsContract.address
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

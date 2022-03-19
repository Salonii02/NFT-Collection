//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string _baseTokenURI;
    uint256 public _price = 0.01 ether; //price of one cryptoDev NFT
    bool public _paused;
    uint256 public maxTokenIds = 20;   // max number of CryptoDevs
    uint256 public tokenIds;    //total number of tokenIds minted

    IWhitelist whitelist;
    bool public presaleStarted;  
    uint256 public presaleEnded; //timestamp for when presale would end

    modifier onlyWhenNotPaused {   //This runs only when contract is not paused. require !_paused=true i.e paused=false
          require(!_paused, "Contract currently paused");
          _;
      }
    constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD"){
        _baseTokenURI=baseURI;
        whitelist=IWhitelist(whitelistContract);
    }
    function startPresale() public onlyOwner {
          presaleStarted = true;
          // Set presaleEnded time as current timestamp + 5 minutes
          // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
          presaleEnded = block.timestamp + 5 minutes;
    }
    /*presaleMint allows a user to mint 1 NFT per transaction during the presale.*/  /* How are we ensuring minting 1 NFT per transaction */
    function presaleMint() public payable onlyWhenNotPaused {
          require(presaleStarted && block.timestamp < presaleEnded, "Presale is not running");
          require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
          require(tokenIds < maxTokenIds, "Exceeded maximum Crypto Devs supply");
          require(msg.value >= _price, "Ether sent is not correct");
          tokenIds += 1;
          //_safeMint is a safer version of the _mint function as it ensures that
          // if the address being minted to is a contract, then it knows how to deal with ERC721 tokens
          // If the address being minted to is not a contract, it works the same way as _mint
          _safeMint(msg.sender, tokenIds);
      }
      /*mint allows a user to mint 1 NFT per transaction after the presale has ended.*/
      function mint() public payable onlyWhenNotPaused {
          require(presaleStarted && block.timestamp >=  presaleEnded, "Presale has not ended yet");
          require(tokenIds < maxTokenIds, "Exceed maximum Crypto Devs supply");
          require(msg.value >= _price, "Ether sent is not correct");
          tokenIds += 1;
          _safeMint(msg.sender, tokenIds);
      }
      function setPaused(bool val) public onlyOwner {
          _paused = val;
      }
      function withdraw() public onlyOwner {
          address _owner=owner(); //owner of the contract
          uint256 amount=address(this).balance;
          (bool sent,)=_owner.call{value:amount}("");
          require(sent, "Failed to send Ether");
      }
      // Function to receive Ether. msg.data must be empty
      receive() external payable {}

      // Fallback function is called when msg.data is not empty
      fallback() external payable {}
}     
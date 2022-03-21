# NFT-Collection

1._baseURI():
Base URI for computing tokenURI. If set, the resulting URI for each token will be the concatenation of the baseURI and the tokenId. Empty by default, can be overriden in child contracts.

2._tokenURI():
 function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
  }
  
 3.OpenSea calls tokenURI() function and gets the url as : https://nft-collection-lilac.vercel.app/api/{tokenId}.
  This url(api endpoint) sends back metadata for cryptodev token in the form of json object:
  creating api end point using nextJS 
  
  
                export default function handler(req, res) {
                // get the tokenId from the query params
                const tokenId = req.query.tokenId;
                // As all the images are uploaded on github, we can extract the images from github directly.
                const image=`https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${tokenId}.svg`;
                const name = `Crypto Devs # ${tokenId}`;
                const description = "Crypto Devs is an NFT collections for crypto devlopers"; 
                // The api is sending back metadata for a Crypto Dev
                // To make our collection compatible with Opensea, we need to follow some Metadata standards
                // when sending back the response from the api
                // More info can be found here: https://docs.opensea.io/docs/metadata-standards
                res.status(200).json({
                  image: image,
                  name: name,
                  description: description,
                });
              }
  
4. OpeanSea uses this information to show our minted NFTs. 
5. For detailed explanation : https://www.youtube.com/watch?v=_g4UQHxhvPo

import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Contract, providers, utils} from "ethers";
import React, { useEffect, useRef, useState } from 'react';
import {abi, NFT_CONTRACT_ADDRESS} from '../constants';
export default function Home() {
  const [walletConnected, setWalletConnected]=useState(false);
  const [presaleStarted, setPresaleStarted]=useState(false);
  const [presaleEnded, setPresaleEnded]=useState(false);
  const [loading,setLoading]=useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };
  const getOwner = async() => {
    try{
        const provider=getProviderOrSigner();
        const nftContract=new Contract(NFT_CONTRACT_ADDRESS,abi,provider);
        const _owner=nftContract.owner();
        // signer now to extract the address of the currently connected MetaMask account
        const signer = await getProviderOrSigner(true);
        const signerAddress= signer.getAddress();
        if(signerAddress.toLowerCase() === _owner.toLowerCase()){
            setIsOwner(true);
        }
    }catch(error){
      console.log(error);
    }
  }
  const startPresale = async() => {
    try{
      const signer=getProviderOrSigner(true);
      const nftContract=new Contract(NFT_CONTRACT_ADDRESS,abi,signer);
      const tx = await nftContract.startPresale();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // set the presale started to true
      await checkIfPresaleStarted();

    }catch(error){
      console.log(error);
    }
  };
  const checkIfPresaleStarted = async() => {
    try{
      const provider=getProviderOrSigner();
      const nftContract=new Contract(NFT_CONTRACT_ADDRESS,abi,provider);
      const _presaleStarted=await nftContract.presaleStarted();
      // if (!_presaleStarted) {
      //   await getOwner();
      // }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    }catch(err){
      console.log(err);
    }
  };
  const checkIfPresaleEnded = async() => {
    try{
      const provider=getProviderOrSigner();
      const nftContract=new Contract(NFT_CONTRACT_ADDRESS,abi,provider);
      const _presaleEnded=await nftContract.presaleEnded();
      // _presaleEnded < Current time
      const hasEnded = _presaleEnded.It(Math.floor(Date.now()/1000));
      setPresaleEnded(hasEnded);
      return hasEnded;
    }catch(error){
      console.log(error);
    }
  };
  const presaleMint = async() => {
    try{
      const signer=getProviderOrSigner(true);
      const nftContract=new Contract(NFT_CONTRACT_ADDRESS,abi,signer);
      const tx= await nftContract.presaleMint({
        value:utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted one Crypto Dev Luckyyy during presale!");
    }catch(error){
      console.log(error);
    }
  };
  const publicMint = async() => {
    try{
      const signer=getProviderOrSigner(true);
      const nftContract=new Contract(NFT_CONTRACT_ADDRESS,abi,signer);
      const tx= await nftContract.mint({
        value:utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted one Crypto Dev!")
    }catch(error){
      console.log(error);
    }
  };
  const getTokenIdsMinted = async() => {
    try{
        const provider=getProviderOrSigner();
        const nftContract=new Contract(NFT_CONTRACT_ADDRESS,abi,provider);
        const _tokenIds = await nftContract.tokenIds();
        setTokenIdsMinted(_tokenIds.toString());
      }catch(error){
      console.log(error);
    }
  }
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
    //getOwner();
    getTokenIdsMinted();
    const _presaleStarted = checkIfPresaleStarted();
    if (_presaleStarted) {
      checkIfPresaleEnded();
    }
    // Set an interval which gets called every 5 seconds to check presale has ended
    const presaleEndedInterval=setInterval(async function(){
      const _presaleStarted=await checkIfPresaleStarted();
      if(_presaleStarted){
        const _presaleEnded=await checkIfPresaleEnded();
        if(_presaleEnded){
          clearInterval(presaleEndedInterval);
        }
      }
    },5*1000);
    setInterval(async function () {
      await getTokenIdsMinted();
    }, 5 * 1000);
  }, [walletConnected]);
  const renderButton = () => {
    if(!walletConnected){
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
    if(isOwner && !presaleStarted){
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }
    if(!presaleStarted){
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }
    if(presaleStarted && !presaleEnded){
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a
            Crypto Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }
    if(presaleStarted && presaleEnded){
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  }
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
  </div>
  )
}

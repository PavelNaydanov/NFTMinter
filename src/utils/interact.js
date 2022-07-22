import { pinJSONToIPFS } from './pinata.js';
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

import contractABI from '../contract-abi.json';
require('dotenv').config();

const web3 = createAlchemyWeb3(`https://eth-rinkeby.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_KEY}`);

const contractAddress = "0x913b3F9dFe114d5305940Fb3D3BE53A34657BaA5";

// TODO: мы не должны тут статусы возвращать
export const connectWalletAsync = async () => {
  if (window.ethereum) {
    try {
      const addresses = await window.ethereum.request({ method: "eth_requestAccounts" });
      const obj = {
        address: addresses[0],
        status: "👆🏽 Write a message in the text-field above.",
      };
      return obj;
    }
    catch (e) {
      return {
        address: "",
        status: "😥 " + e.message,
      };
    }
  }
  else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addresses = await window.ethereum.request({ method: "eth_accounts" });

      if (addresses.length > 0) {
        return {
          address: addresses[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      }
      else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async(url, name, description) => {
  if (url.trim() === "" || (name.trim() === "" || description.trim() === "")) {
    return {
     success: false,
     status: "❗Please make sure all fields are completed before minting.",
    }
  }

  const pinataResponse = await pinJSONToIPFS({
    name,
    image: url,
    description: description
  });

  if (!pinataResponse.success) {
      return {
        success: false,
        status: "😢 Something went wrong while uploading your tokenURI.",
      }
  }
  const tokenURI = pinataResponse.pinataUrl;

  window.contract = await new web3.eth.Contract(contractABI, contractAddress);

  //set up your Ethereum transaction
 const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    'data': window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeABI() //make call to NFT smart contract
  };

  //sign the transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
    });

    return {
      success: true,
      status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash
    }
  }
  catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message
    }
  }
}
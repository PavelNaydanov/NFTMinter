import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { AbiItem } from 'web3-utils';

import { pinJSONToIPFS } from 'app/utils/pinata';
import contractABI from 'app/shared/abi/contract-abi.json';

require('dotenv').config();

const web3 = createAlchemyWeb3(`https://eth-rinkeby.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_KEY}`);

const contractAddress = "0x1d0648b22ae1beA1F11f78c345AD845e995C918f";

// TODO: мы не должны тут статусы возвращать
export const connectWalletAsync = async () => {
  if (window.ethereum) {
    try {
      const addresses: any = await window.ethereum.request({ method: "eth_requestAccounts" });
      const obj = {
        address: addresses[0],
        status: "👆🏽 Write a message in the text-field above.",
      };
      return obj;
    }
    catch (error: unknown) {
      return {
        address: "",
        status: "😥 " + (error as Error).message,
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
      const addresses: any = await window.ethereum.request({ method: "eth_accounts" });

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
    }
    catch (error: unknown) {
      return {
        address: "",
        status: "😥 " + (error as Error).message,
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

export const mintNFT = async(url: string, name: string, description: string) => {
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

  window.contract = await new web3.eth.Contract((contractABI as AbiItem[]), contractAddress);

  //set up your Ethereum transaction
 const transactionParameters = {
    to: contractAddress,
    from: window.ethereum && window.ethereum.selectedAddress,
    'data': window.contract.methods.mintNFT(window.ethereum && window.ethereum.selectedAddress, tokenURI).encodeABI()
  };

  //sign the transaction via Metamask
  try {
    const txHash = window.ethereum && await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
    });

    return {
      success: true,
      status: "✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/" + txHash
    }
  }
  catch (error: unknown) {
    return {
      success: false,
      status: "😥 Something went wrong: " + (error as Error).message
    }
  }
}
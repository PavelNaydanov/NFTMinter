import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract } from "web3"

declare global {
  interface Window{
    ethereum?: MetaMaskInpageProvider,
    contract: Contract
  }
}
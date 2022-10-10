// constants
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import ethContract from "../contracts/doxa-ico.json";
import usdtContract from "../contracts/usdt.json";
import daiContract from "../contracts/dai.json"
import { useDispatch } from "react-redux";
import store from './store';


const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

export const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

export const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ADDRESS",
    payload: payload,
  };
};

const getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          
          rpc: {
                56: "https://bsc-dataseed.binance.org",
                97: "https://data-seed-prebsc-1-s1.binance.org:8545/"
          }
        }
      },

      fortmatic: {
        package: Fortmatic, // required
        options: {
          key: "pk_test_F3E84010E6D100A9" // required
        }
      }
    }
    return providerOptions;
}

export const connectWallet = () => {
    return async(dispatch) => {
        dispatch(connectRequest());
        try {
            const web3Modal = new Web3Modal({
                cacheProvider: true,
                providerOptions: getProviderOptions() // required
            });
    
            const provider = await web3Modal.connect();
            const ICOEthContractAddress = process.env.REACT_APP_ICOEthContractAddress
            const usdtContractAddress = process.env.REACT_APP_usdtContractAddress;
            const daiContractAddress = process.env.REACT_APP_daiContractAddress

            await subscribeProvider(provider, dispatch);
            
            const web3 = new Web3(provider);

            web3.eth.extend({
              methods: [
                {
                  name: "chainId",
                  call: "eth_chainId",
                  outputFormatter: web3.utils.hexToNumber
                }
              ]
            });
        
            const accounts = await web3.eth.getAccounts();
            const address = accounts[0];
            const ethInstance = new web3.eth.Contract(
              ethContract,
              ICOEthContractAddress
            );
          
            const usdt = new web3.eth.Contract(
              usdtContract,
              usdtContractAddress
            );

            const dai = new web3.eth.Contract(
              daiContract,
              daiContractAddress
            );

            dispatch(
                connectSuccess({
                    address,
                    web3,
                    ethICO: ethInstance,
                    usdt: usdt,
                    dai: dai,
                    provider,
                    connected: true,
                    web3Modal
                })
            );
        } catch (e) {
          
            dispatch(connectFailed(e));
        }
    }
}


const subscribeProvider = async(provider) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", async (accounts) => {
         
        store.dispatch(updateAccountRequest({ address: accounts[0] }));
        const doxaUser = localStorage.getItem("doxa-user");
        if(!doxaUser) {
          window.open(window.location.origin + "/", "_self")
          return;
        }
        const state = store.getState();
      
        window.location.reload();
    });
}

export async function addNetwork(id) {
  let networkData;
  switch (id) {
    //bsctestnet
    case 97:
      networkData = [
        {
          chainId: "0x61",
          chainName: "BSCTESTNET",
          rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
          nativeCurrency: {
            name: "BINANCE COIN",
            symbol: "BNB",
            decimals: 18,
          },
          blockExplorerUrls: ["https://testnet.bscscan.com/"],
        },
      ];

      break;
    //bscmainet
    case 56:
      networkData = [
        {
          chainId: "0x38",
          chainName: "BSCMAINET",
          rpcUrls: ["https://bsc-dataseed1.binance.org"],
          nativeCurrency: {
            name: "BINANCE COIN",
            symbol: "BNB",
            decimals: 18,
          },
          blockExplorerUrls: ["https://testnet.bscscan.com/"],
        },
      ];
      break;

    case 4:
      networkData = [
        {
          chainId: "0x4",
        }
      ];
      return window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: networkData,
      });
    default:
      break;
  }
  return window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: networkData,
  });
}
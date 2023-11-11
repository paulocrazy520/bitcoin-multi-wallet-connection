import { useEffect, useState } from 'react'
import useUnisat from './useUnisat'
import useXverse from './useXverse'
import useHiro from './useHiro'
import axios from 'axios'
import { signMessage as satSignMessage } from "sats-connect";
import { AppConfig, openSignatureRequestPopup } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { BTCNETWORK } from "../utils/constants";

const appConfig = new AppConfig();

export default function useMultiWallet() {
  const [connected, setConnected] = useState(false)
  const [walletIndex, setWalletIndex] = useState(0)
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState()
  const [balance, setBalance] = useState(0)
  const [connectUnisat, disconnectUnisat, unisatAddress, unisatConnected, unisatSend, unisatBalance] = useUnisat(walletIndex)
  const [connectXverse, disconnectXverse, xverseAddress, xverseConnected, xverseSend,] = useXverse()
  const [connectHiro, disconnectHiro, hiroAddress, hiroConnected, hiroSend, session, auth] = useHiro(walletIndex)


  const sendSignMessage = async (message) => {
    console.log("*******Sign Message!!", message, address)
    switch (walletIndex) {
      case 0:
        if (window.unisat) {
          const strSignatrue = await unisat.signMessage(message);
          return strSignatrue;
        }
        break;
      case 1:
        const strHiroSignatrue = await new Promise((res, rej) => {
          openSignatureRequestPopup({
            network: BTCNETWORK == 0 ? StacksTestnet : StacksMainnet,
            appDetails: {
              name: 'Hiro Wallet Sign',
              icon: window.location.origin + '/src/assets/icons/ada.png'
            },
            message: message,
            onFinish: (response) => {
              res(response.signature);
            },
            onCancel: () => console.log("Hiro Sign Canceled!"),
          });
        });

        return strHiroSignatrue
      case 2:
        const strXverseSignature = await new Promise((res, rej) => {
          satSignMessage({
            payload: {
              network: {
                type: network,
              },
              address,
              message,
            },
            onFinish: (response) => {
              res(response);
            },
            onCancel: () => console.log("Xverse Sign Canceled!"),
          });
        });

        return strXverseSignature;
    }
  }

  const disconnectWallet = () => {
    switch (walletIndex) {
      case 0:
        return disconnectUnisat()
      case 1:
        return disconnectHiro()
      case 2:
        return disconnectXverse()
      default:
        break
    }
  }

  const connectWallet = async index => {
    switch (index) {
      case 0:
        return await connectUnisat()
      case 1:
        return await connectHiro()
      case 2:
        return await connectXverse()
      default:
        break
    }
  }

  const sendBitcoin = async (to, amount) => {
    // console.log('sending bitcoin :>> ', to, amount, walletIndex);
    switch (walletIndex) {
      case 0:
        return await unisatSend(to, amount)
      case 1:
        return await hiroSend(to, amount)
      case 2:
        return await xverseSend(to, amount)
      default:
        break
    }
  }


  const getBalance = async (address) => {
    if (!address)
      return;

    try {
      const response = await axios.get(`https://mempool.space/api/address/${address}`)
      return response?.data?.chain_stats.funded_txo_sum
    }
    catch (e) {
      console.log(e);
    }
  }


  useEffect(async () => {
    switch (walletIndex) {
      case 0:
        setAddress(unisatAddress)
        setConnected(unisatConnected)
        setBalance(await getBalance(unisatAddress));
        break
      case 1:
        setAddress(hiroAddress)
        setConnected(hiroConnected)
        setBalance(await getBalance(hiroAddress));
        break
      case 2:
        setAddress(xverseAddress)
        setConnected(xverseConnected)
        setBalance(await getBalance(xverseAddress));
        break
      default:
        break
    }
  }, [walletIndex, unisatAddress, unisatConnected, hiroAddress, hiroConnected, xverseAddress, xverseConnected])

  return [walletIndex, setWalletIndex, connectWallet, address, connected, network, sendBitcoin, balance, disconnectWallet, sendSignMessage]
}

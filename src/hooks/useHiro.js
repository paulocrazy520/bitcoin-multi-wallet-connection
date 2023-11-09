import { useEffect, useRef, useState } from "react";
import useToast from "./useToast";
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { BTCNETWORK } from "../utils/constants";

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

var resolve = function (cardinalAddress, ordinalAddress) {
  // use addresses
};

let currentNetwork = ''

export default function useHiro() {

  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState(null);
  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const { messageApi } = useToast();

  const connectWallet = async () => {
    return new Promise((res, rej) => {
      let ret = false;
      messageApi.notifyWarning('Connectting Hiro wallet!', 3)
      // if (!userSession.isUserSignedIn()) {
      showConnect({
        userSession,
        network: BTCNETWORK == 0 ? StacksTestnet : StacksMainnet,
        appDetails: {
          name: 'Wallet Connection Test'
        },
        onFinish: () => {
          messageApi.notifySuccess('Hiro wallet connect success.')
          // console.log('userSession.loadUserData().profile.btcAddress :>> ', userSession.loadUserData());
          resolve(userSession.loadUserData().profile.btcAddress.p2wpkh.mainnet,
            userSession.loadUserData().profile.btcAddress.p2tr.mainnet);
          const mainAddress = userSession.loadUserData().profile.btcAddress.p2wpkh.mainnet;
          const testAddress = userSession.loadUserData().profile.btcAddress.p2wpkh.testnet;
          setAddress(BTCNETWORK == 0 ? testAddress : mainAddress)
          setConnected(true);
          res(true);
        },
        onCancel: () => {
          // handle if user closed connection prompt
          messageApi.notifyWarning('User disconnected Hiro wallet!', 3)
          setConnected(false);
          res(false);
        },
      });
    })
  }

  const hiroSend = async (to, amount) => {
    let txid = null;
    try {
      const resp = await window.btc?.request('sendTransfer', {
        address: to,
        amount: amount
      });
      txid = resp.result.txid;
    } catch (error) {
      console.log(error);
    }
    return txid;
  }
  return [connectWallet, address, connected, hiroSend]//, unisatSend, balance]

}
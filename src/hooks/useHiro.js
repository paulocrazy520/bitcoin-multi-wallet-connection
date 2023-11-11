import { useState } from "react";
import useToast from "./useToast";
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { BTCNETWORK } from "../utils/constants";

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

export default function useHiro() {

  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const { messageApi } = useToast();
  const [session ,setSession] = useState(userSession);
  const [auth, setAuth] = useState("");

  const disconnectWallet = () => {
    setConnected(false);
    messageApi.notifyWarning('User disconnected Hiro wallet!', 3)
  }
  const connectWallet = async () => {
    return new Promise((res, rej) => {
      let ret = false;

      messageApi.notifyWarning('Connecting Hiro wallet!', 3)
      showConnect({
        userSession,
        network: BTCNETWORK == 0 ? StacksTestnet : StacksMainnet,
        appDetails: {
          name: 'Hiro Wallet Connection Test',
          icon: window.location.origin + '/src/assets/icons/ada.png'
        },
        onFinish: (response) => {
          messageApi.notifySuccess('Hiro wallet connection success.')
          const mainAddress = userSession.loadUserData().profile.btcAddress.p2wpkh.mainnet;
          const testAddress = userSession.loadUserData().profile.btcAddress.p2wpkh.testnet;
          setAddress(BTCNETWORK == 0 ? testAddress : mainAddress)
          setConnected(true);
          setSession(response.userSession);
          setAuth(response.authResponsePayload);

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
  return [connectWallet, disconnectWallet, address, connected, hiroSend, session, auth]//, unisatSend, balance]

}
import { useEffect, useRef, useState } from "react";
import useToast from "./useToast";
import { BTCNETWORK } from "../utils/constants";

let currentNetwork = ''
const netArray = ["testnet", "livenet"]
export default function useUnisat(walletIndex) {

  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState("livenet");
  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const { messageApi } = useToast();

  const disconnectWallet = () =>{
    setConnected(false);
    messageApi.notifyWarning('User disconnected Unisat wallet!', 3)
  }

  const connectWallet = async () => {
    if (!window.unisat) {
      messageApi.notifyWarning('Please install Unisat wallet!', 3)
      return false;
    }
    const connect = await checkConnect();
    if (!connect) return false;
    try {
      const result = await window.unisat.requestAccounts();
      await window.unisat.switchNetwork(netArray[BTCNETWORK])
      handleAccountsChanged(result);
      setConnected(true);
      messageApi.notifySuccess('Unisat Wallet is connected!', 3)
      return true
    } catch (error) {
      return false;
    }
  }

  const checkConnect = async () => {
    return new Promise(async (res, rej) => {

      currentNetwork = '';
      setTimeout(async () => {
        if (currentNetwork === '') {
          // setConnected(false);
          messageApi.notifyWarning(
            'Unisat wallet is disconnected! Please reload the page.',
            5
          )
          setConnected(false)
          await window.unisat.requestAccounts();
          setConnected(true)

          res(false);
        }
      }, 1000);
      if (!connected)
        currentNetwork = await window.unisat.getNetwork();
      else
        currentNetwork = await window.unisat.requestAccounts();
      console.log('Wallet is connected!');
      res(true)
    })
  }

  const getBasicInfo = async () => {
    const unisat = (window).unisat;
    const [address] = await unisat.getAccounts();
    setAddress(address);

    const publicKey = await unisat.getPublicKey();
    setPublicKey(publicKey);

    const balance = await unisat.getBalance();
    setBalance(balance);

    const network = await unisat.getNetwork();
    setNetwork(network);
  };

  const selfRef = useRef({
    accounts: [],
  });

  const self = selfRef.current;
  const handleAccountsChanged = (_accounts) => {
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setAddress(_accounts[0]);

      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const handleNetworkChanged = (network) => {
    setNetwork(network);
    getBasicInfo();
  };


  useEffect(() => {
    if (walletIndex != 0) return;
    if (window.unisat) {
      setUnisatInstalled(true);
    } else {
      return;
    }
    window.unisat.getAccounts().then((accounts) => {
      handleAccountsChanged(accounts);
    });

    window.unisat.on("accountsChanged", handleAccountsChanged);
    window.unisat.on("networkChanged", handleNetworkChanged);
    getBasicInfo();

    return () => {
      window.unisat.removeListener("accountsChanged", handleAccountsChanged);
      window.unisat.removeListener("networkChanged", handleNetworkChanged);
    };
  }, [walletIndex])

  useEffect(() => {
    if (connected)
      getBasicInfo();
  }, [connected])

  const unisatSend = async (to, amount) => {
    let txid = null;
    console.log('sending bitcoin :>> ', to, amount);
    try {
      txid = await window.unisat.sendBitcoin(to, amount);
    } catch (error) {
      console.log(error);
    }
    return txid
  }
  return [connectWallet, disconnectWallet, address, connected, unisatSend, balance]

}
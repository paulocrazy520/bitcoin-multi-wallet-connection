import { useEffect, useState } from 'react'
import useUnisat from './useUnisat'
import useXverse from './useXverse'
import useHiro from './useHiro'

export default function useMultiWallet() {
  const [connected, setConnected] = useState(false)
  const [walletIndex, setWalletIndex] = useState(0)
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('')
  const [balance, setBalance] = useState(0)
  const [connectUnisat, unisatAddress, unisatConnected, unisatSend, unisatBalance] = useUnisat(walletIndex)
  const [connectXverse, xverseAddress, xverseConnected, xverseSend] = useXverse()
  const [connectHiro, hiroAddress, hiroConnected, hiroSend, hiroBalance] = useHiro(walletIndex)

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

  useEffect(() => {
    switch (walletIndex) {
      case 0:
        setAddress(unisatAddress)
        setConnected(unisatConnected)
        break
      case 1:
        setAddress(hiroAddress)
        setConnected(hiroConnected)
        break
      case 2:
        setAddress(xverseAddress)
        setConnected(xverseConnected)
        break

      default:
        break
    }
  }, [walletIndex, unisatAddress, unisatConnected, hiroAddress, hiroConnected, xverseAddress, xverseConnected])

  useEffect(() => {
    switch (walletIndex) {
      case 0:
        unisatBalance && setBalance(unisatBalance.confirmed)
        break
      case 1:
        break

      default:
        break
    }
  }, [walletIndex, unisatBalance])

  return [walletIndex, setWalletIndex, connectWallet, address, connected, network, sendBitcoin, balance]
}

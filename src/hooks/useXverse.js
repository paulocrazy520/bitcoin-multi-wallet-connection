import { useEffect, useRef, useState } from 'react'
import { getAddress, signTransaction } from 'sats-connect'
import { BTCNETWORK } from '../utils/constants'
import { hex, base64 } from '@scure/base'
import * as btc from 'micro-btc-signer'
import * as secp256k1 from '@noble/secp256k1'
import axios from 'axios'
import useToast from './useToast'

const netArray = ['Testnet', 'Mainnet']
const bitcoinTestnet =
  BTCNETWORK == 0
    ? {
      bech32: 'tb',
      pubKeyHash: 0x6f,
      scriptHash: 0xc4,
      wif: 0xef,
    }
    : {
      bech32: 'bc',
      pubKeyHash: 0x00,
      scriptHash: 0x05,
      wif: 0x80,
    }

const BTC_NETWORK = BTCNETWORK == 0 ? 'Testnet' : 'Mainnet'

export default function useXverse() {
  const [connected, setConnected] = useState(false)
  const [paymentAccount, setPaymentAccount] = useState(null)
  const [ordinalsAccount, setOrdinalsAccount] = useState(null)
  const [address, setAddress] = useState('')
  const { messageApi } = useToast()


  const disconnectWallet = () => {
    setConnected(false);
    messageApi.notifyWarning('User disconnected Xverse wallet!', 3)
  }

  const connectWallet = async () => {
    let ret = false
    const getAddressOptions = {
      payload: {
        purposes: ['payment', 'ordinals'],
        message: 'Address for receiving Ordinals and payments',
        network: {
          type: netArray[BTCNETWORK],
        },
      },
      onFinish: response => {
        console.log("*********XVerse Return", response);
        const add = response.addresses[0].address
        messageApi.notifySuccess('Xverse Wallet connect success!')
        setAddress(add)
        setConnected(true)
        setPaymentAccount(response.addresses[0])
        setOrdinalsAccount(response.addresses[1])
        ret = true
      },
      onCancel: () => {
        messageApi.notifyFailed('Xverse Wallet connect Failed!')
      },
    }

    try {
      const address = await getAddress(getAddressOptions)
    } catch (error) {
      console.log(error.message)
      if (error.message == 'No Bitcoin Wallet installed') messageApi.notifyFailed('Please install Xverse Wallet!')
    }
    return ret
  }

  const xverseSend = async (to, amount) => {
    let txid = null
    const feeData = await axios.get(`https://mempool.space/api/v1/fees/recommended`)
    const feeRate = feeData.data.hourFee
    const psbtBase64 = await generatePSBT(paymentAccount, to, amount, null, feeRate)

    if (!psbtBase64) {
      return
    }

    const signPsbtOptions = {
      payload: {
        network: {
          type: BTC_NETWORK,
        },
        message: 'Sign Transaction',
        psbtBase64,
        broadcast: true,
        inputsToSign: [
          {
            address: paymentAccount.address,
            signingIndexes: [0],
          },
        ],
      },
      onFinish: response => {
        txid = response.txId
      },
      onCancel: () => { },
    }

    await signTransaction(signPsbtOptions)
    return txid
  }


  return [connectWallet, disconnectWallet, address, connected, xverseSend]
}

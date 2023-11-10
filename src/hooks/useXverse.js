import { useEffect, useRef, useState } from 'react'
import { getAddress, signTransaction } from 'sats-connect'
import { BTCNETWORK } from '../utils/constants'
import { hex, base64 } from '@scure/base'
import * as btc from 'micro-btc-signer'
import * as secp256k1 from '@noble/secp256k1'
import axios from 'axios'
import useToast from './useToast'

let currentNetwork = ''
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

const DUMMY_PRIVATEKEY = '0000000000000000000000000000000000000000000000000000000000000001'

export default function useXverse() {
  const [connected, setConnected] = useState(false)
  const [paymentAccount, setPaymentAccount] = useState(null)
  const [ordinalsAccount, setOrdinalsAccount] = useState(null)
  const [address, setAddress] = useState('')
  const { messageApi } = useToast()


  const disconnectWallet = () => {
    setConnected(false);
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

  async function generatePSBT(account, recipientAddress, btcAmount, pinnedUtxoTxid, feeRate) {
    const utxoUrl =
      BTCNETWORK == 0
        ? `https://mempool.space/testnet/api/address/${account.address}/utxo`
        : `https://mempool.space/api/address/${account.address}/utxo`

    try {
      let utxos = await axios.get(utxoUrl)
      if (!utxos || !utxos.data.length) {
        messageApi.notifyFailed('Insufficient BTC balance.')
        return
      }

      utxos = utxos.data

      const confirmedUtxos = utxos.filter(utxo => utxo.status.confirmed)

      confirmedUtxos.sort((utxo1, utxo2) => {
        if (utxo1.txid === pinnedUtxoTxid) {
          return 1
        } else if (utxo2.txid === pinnedUtxoTxid) {
          return -1
        } else {
          return utxo1.value - utxo2.value
        }
      })

      let totalUtxoValue = 0

      const publicKey = hex.decode(account.publicKey)

      const p2wpkh = btc.p2wpkh(publicKey, bitcoinTestnet)
      const p2sh = btc.p2sh(p2wpkh, bitcoinTestnet)

      const dummyP2wpkh = btc.p2wpkh(secp256k1.getPublicKey(DUMMY_PRIVATEKEY, true), bitcoinTestnet)
      const dummyP2sh = btc.p2sh(dummyP2wpkh, bitcoinTestnet)

      const tx = new btc.Transaction()
      const feeTx = new btc.Transaction()

      const tempUtxos = []
      for (let index = 0; index < confirmedUtxos.length; index++) {
        tempUtxos.push(confirmedUtxos[index])

        const utxo = {
          txid: confirmedUtxos[index].txid,
          index: confirmedUtxos[index].vout,
          witnessUtxo: {
            // eslint-disable-next-line no-undef
            script: p2sh.script ? p2sh.script : Buffer.alloc(0),
            amount: BigInt(confirmedUtxos[index].value),
          },
          // eslint-disable-next-line no-undef
          redeemScript: p2sh.redeemScript ? p2sh.redeemScript : Buffer.alloc(0),
        }

        const dummyUtxo = {
          txid: confirmedUtxos[index].txid,
          index: confirmedUtxos[index].vout,
          witnessUtxo: {
            // eslint-disable-next-line no-undef
            script: dummyP2sh.script ? dummyP2sh.script : Buffer.alloc(0),
            amount: BigInt(confirmedUtxos[index].value),
          },
          // eslint-disable-next-line no-undef
          redeemScript: dummyP2sh.redeemScript ? dummyP2sh.redeemScript : Buffer.alloc(0),
        }

        tx.addInput(utxo, true)
        feeTx.addInput(dummyUtxo, true)

        totalUtxoValue += confirmedUtxos[index].value

        if (totalUtxoValue > btcAmount) {
          feeTx.addOutputAddress(recipientAddress, BigInt(btcAmount), bitcoinTestnet)
          feeTx.addOutputAddress(account.address, BigInt(totalUtxoValue) - BigInt(btcAmount), bitcoinTestnet)

          feeTx.sign(hex.decode(DUMMY_PRIVATEKEY))
          feeTx.finalize()

          const feeAmount = BigInt(feeRate) * BigInt(feeTx.vsize)

          if (feeAmount < BigInt(totalUtxoValue) - BigInt(btcAmount)) {
            tx.addOutputAddress(recipientAddress, BigInt(btcAmount), bitcoinTestnet)
            tx.addOutputAddress(account.address, BigInt(totalUtxoValue) - BigInt(btcAmount) - feeAmount, bitcoinTestnet)

            const psbt = tx.toPSBT(0)
            const psbtBase64 = base64.encode(psbt)

            return psbtBase64
          }
        }
      }
      messageApi.notifyFailed('Insufficient BTC balance.')
    } catch (error) {
      console.error(error)
    }
  }

  return [connectWallet, disconnectWallet, address, connected, xverseSend]
}

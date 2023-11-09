import React, { useEffect, useState } from 'react'

import CopyIcon from '../assets/icons/CopyIcon'
import InfoIcon from '../assets/icons/InfoIcon'
import DblArrow from '../assets/icons/DblArrow'
import bitCoinIcon from '../assets/icons/bitcoin.svg'
import ordinalsIcon from '../assets/icons/ordinals.svg'
import ArrowDown from '../assets/icons/ArrowDown'
import DataList from '../components/DataList'
import { searchOptions } from '../assets/data'
import CancelIcon from '../assets/icons/CancelIcon'
import useTime from '../hooks/useTime'
import { useAuthState } from '../context/AuthContext'
import WalletIcon from '../assets/icons/WalletIcon'
import { validate, getAddressInfo } from 'bitcoin-address-validation'
import useToast from '../hooks/useToast'
import {
  APP_MODE,
  BTCNETWORK,
  factoryWalletAddress,
  formatBTCNumber
} from '../utils/constants'
import { useModalState } from '../context/ModalContext'
import ReactPortal from '../components/ReactPortal'
import axios from 'axios'
import {
  BTCMainExplorerUrl,
  BTCTestExplorerUrl,
  checkOrderApi,
  feeRateURL,
  getEndtimeApi,
  getStarttimeApi,
  getTransactionApi,
  tokenTransferApi
} from '../utils/apiRoutes'
import useGetBalance from '../hooks/useGetBalance'
import {
  getFeeConstant,
  getOrderList,
  getVaultaddress,
  getWalletTransaction
} from '../utils/getAPIs'
import { useGetTotalAmount } from '../hooks/useGetTotalAmount'
import moment from 'moment'
import useWhiteListed from '../hooks/useWhiteListed'

const ORDER_STATUS_ORDERED = 1
const ORDER_STATUS_FEE_TRANSACTION_CONFIRMED = 2
const ORDER_STATUS_TOKEN_TRANSFER_INSCRIBED = 3
const ORDER_STATUS_TOKEN_TRANSFERED = 4
const ORDER_STATUS_FAILED = 5
const ORDER_STATUS_CONFIRMED = 6
const orderStatusStings = [
  '',
  'Orderd',
  'Pending',
  'Pending',
  'Pending',
  'Failed',
  'Success'
]

const rateTexts = [
  {
    title: 'Fast',
    text1: 'About 10',
    text2: 'minutes'
  },
  {
    title: 'Avg',
    text1: 'About 30',
    text2: 'minutes'
  },
  {
    title: 'Slow',
    text1: 'About 1',
    text2: 'hour'
  }
]

function Home () {
  const { walletContext } = useAuthState()
  const { messageApi } = useToast()
  const {
    walletIndex,
    setWalletIndex,
    connectWallet,
    address,
    connected,
    network,
    sendBitcoin,
    walletList,
    setWalletList
  } = walletContext

  const [currnetTimestamp, delta1, delta2, started, startTime, endTime, ended] =
    useTime()
  const [toggleDataList, setToggleDataList] = useState(false)
  const [toggleSteps, setToggleSteps] = useState(false)
  const [selectedOption, setSelectedOption] = useState({
    value: 'BTC',
    icon: bitCoinIcon
  })

  const [receiverAddress, setReceiverAddress] = useState('')
  const [whiteListed] = useWhiteListed(receiverAddress, address)
  const [bTCAmount, setBTCAmount] = useState('')
  const [oxinAmount, setOxinAmount] = useState('')
  const [isMAX, setIsMAX] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { modalState, openModal, closeModal, addModal, removeModal } =
    useModalState()
  const [feeRateIndex, setFeeRateIndex] = useState(1)
  const [feeArray, setFeeArray] = useState([0, 0, 0, 0])
  const [feeConstants, setFeeConstants] = useState({})
  const [getBTCBalance, getTokenBalance] = useGetBalance()
  const [oxinBalance, setOxinBalance] = useState(0)
  const [btcBalance, setBtcBalance] = useState(0)
  const [lastOrder, setLastOrder] = useState(null)
  const [customFeeRate, setCustomFeeRate] = useState(0)
  const [vaultAddress, setVaultAddress] = useState('')
  const [prgress, setProgress] = useGetTotalAmount()
  const [rateReverse, setrateReverse] = useState(0.000007)

  useEffect(() => {
    if (whiteListed) setrateReverse(0.000004)
    else setrateReverse(0.0000055)
  }, [whiteListed])

  const getOrder = async () => {
    const order = await getOrderList(address)
    // console.log('order :>> ', order);
    if (order.length > 0) {
      const sorted = order.sort((a, b) => b.timestamp - a.timestamp)
      setLastOrder(sorted[0])
    } else {
      setLastOrder(null)
    }
  }

  useEffect(() => {
    if (address?.length > 4) {
      getOrder()
      const interval = setInterval(() => {
        getOrder()
      }, 10000)
      return () => {
        clearInterval(interval)
      }
    }
  }, [address])

  useEffect(() => {
    const func = async () => {
      const net = BTCNETWORK == 0 ? 'testnet' : 'mainnet'
      if (validate(receiverAddress, net)) {
        const bal = await getTokenBalance('oxin', receiverAddress)
        setOxinBalance(bal)
      } else setOxinAmount('')
    }
    func()
  }, [receiverAddress])

  const fetchFeeConst = async () => {
    const feeConst = await getFeeConstant()
    setFeeConstants(feeConst)
  }

  useEffect(() => {
    const func = async () => {
      const { data: feeRes } = await axios.get(feeRateURL)
      setFeeArray([feeRes.fastestFee, feeRes.halfHourFee, feeRes.hourFee])
      const add = await getVaultaddress()
      setVaultAddress(add)
      fetchFeeConst()
    }
    func()
  }, [])

  useEffect(() => {
    const func = async () => {
      const net = BTCNETWORK == 0 ? 'testnet' : 'mainnet'
      if (validate(address, net)) {
        const btc = await getBTCBalance(address)
        setBtcBalance(btc)
        const wallet = getWalletTransaction
        // console.log('btc :>> ', btc);
      }
    }
    func()
    setReceiverAddress(address)
  }, [address])

  const handleToggleDataList = e => {
    e.preventDefault()
    setToggleDataList(!toggleDataList)
  }

  const ConnectBtn = () => (
    <button
      className='flex items-center gap-8 mx-auto text-4xl d-btn d-btn-primary active'
      onClick={() => {
        setWalletList(!walletList)
      }}
    >
      <WalletIcon viewBox='0 0 22 22' classes='icon' />
      Connect Wallet
    </button>
  )

  const PurchaseBtn = () => {
    const disabled = lastOrder && lastOrder.order_status < 5
    return (
      <button
        className='flex items-center gap-8 mx-auto text-4xl d-btn d-btn-primary active'
        onClick={handlePurchaseBtn}
        disabled={disabled}
      >
        Purchase Now <DblArrow />
      </button>
    )
  }
  const validateInput = () => {
    const net = BTCNETWORK == 0 ? 'testnet' : 'mainnet'

    if (!validate(receiverAddress, net)) {
      messageApi.notifyWarning('Invalid Recipient address!')
      return false
    }

    if (!validate(address, net)) {
      messageApi.notifyWarning('Invalid Network!')
      return false
    }

    if (bTCAmount == '' || oxinAmount == 0) {
      messageApi.notifyWarning('Please input token amount to buy.')
      return false
    }

    if (oxinAmount < 200) {
      messageApi.notifyWarning('Minimum token amount is 200.')
      return false || !APP_MODE
    }

    if (bTCAmount * 1e8 > btcBalance && APP_MODE) {
      messageApi.notifyWarning('Insufficient BTC balance.')
      return false
    }

    if (!started && APP_MODE) {
      messageApi.notifyWarning('Please wait until presale starts.')
      return false
    }

    if (ended && APP_MODE) {
      messageApi.notifyWarning('Presale has ended!')
      return false
    }

    return true
  }

  const handlePurchaseBtn = async () => {
    if (validateInput()) {
      openModal()
      const { data: feeRes } = await axios.get(feeRateURL)
      setFeeArray([feeRes.fastestFee, feeRes.halfHourFee, feeRes.hourFee])
      // console.log('feeRes :>> ', feeRes);
    }
  }

  const handlePurchase = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      messageApi.notifyWarning('Checking your order...', 6)
      const fee = Math.round(calcFee() * 1e8)
      const feeRate = feeRateIndex < 3 ? feeArray[feeRateIndex] : customFeeRate
      // console.log('fee :>> ', fee);
      const checkBody = {
        btc_sender_address: address,
        token_receiver_address: receiverAddress,
        fee_rate: feeRate,
        btc_amount: fee,
        token_amount: Number(oxinAmount)
      }
      let data,
        checkRes = {},
        vaultAddress = ''
      try {
        checkRes = await axios.post(checkOrderApi, checkBody)
        vaultAddress = await getVaultaddress()
        console.log('checkBody, checkRes :>> ', checkBody, checkRes)
      } catch (error) {
        console.log('error :>> ', error)
        messageApi.notifyFailed('Order check network error.')
      }
      data = checkRes.data
      if (data.status == 'success') {
        // console.log('sending bitcoin :>> ', vaultAddress, fee);
        messageApi.notifySuccess('Order check success!', 3)

        const tx_id = await sendBitcoin(vaultAddress, fee)
        if (tx_id) {
          const body = {
            txid: tx_id,
            btc_sender_address: address,
            token_receiver_address: receiverAddress,
            fee_rate: feeRate,
            btc_amount: fee,
            token_amount: Number(oxinAmount)
          }
          const res = await axios.post(tokenTransferApi, body)
          // console.log('body,tokenTransferApi', body, res);
          if (res.data.status == 'success') {
            await getOrder()
            messageApi.notifySuccess('Your order was successfully added!', 10)
          } else {
            messageApi.notifyFailed('Your order was failed.')
          }
        } else {
          messageApi.notifyFailed('User cancelled order.')
        }
      } else {
        console.log('checkres :>> ', data)
        messageApi.notifyFailed(data.description)
      }
    } catch (error) {
      console.log(error)
      messageApi.notifyFailed('User cancelled order.')
    }
    closeModal()
    setIsLoading(false)
  }

  const handleBTCChange = e => {
    let value = e.target.value.trim().replace(/\s+/g, '')
    if (!isNaN(value)) {
      if (value < 0) value = -value
      const tokenAmount = Math.floor(value / rateReverse)
      setBTCAmount(value)
      setOxinAmount(tokenAmount)
    }
  }

  const handleOxinChange = e => {
    let value = Number(e.target.value)
    if (isNaN(value)) {
      setOxinAmount(0)
      setBTCAmount(0)
    } else {
      value = Math.floor(value)
      setOxinAmount(value)
      setBTCAmount(formatBTCNumber(Math.ceil(1e8 * value * rateReverse) / 1e8))
    }
  }

  const calcFee = () => {
    if (feeRateIndex < 3)
      return formatBTCNumber(
        (feeConstants.static_fee +
          feeConstants.dynamic_fee * feeArray[feeRateIndex]) /
          1e8 +
          Number(bTCAmount)
      )
    else
      return formatBTCNumber(
        (feeConstants.static_fee + feeConstants.dynamic_fee * customFeeRate) /
          1e8 +
          Number(bTCAmount)
      )
  }

  return (
    <>
      {modalState.open && (
        <ReactPortal>
          <section className='modal__content'>
            <h2 className='leading-normal'>{`Are you sure to buy ${oxinAmount} oxin with ${calcFee()} BTC?`}</h2>
            <div className='flex flex-wrap justify-center w-full gap-8 mt-16'>
              {rateTexts.map((item, index) => (
                <button
                  className={`d-btn d-btn-block ${
                    index == feeRateIndex && 'd-btn-primary'
                  }`}
                  onClick={() => {
                    !isLoading && setFeeRateIndex(index)
                  }}
                  key={index}
                >
                  <div className='py-2 text-4xl'>{item.title}</div>
                  <div className='py-2 text-grey-d1'>
                    {feeArray[index]} sat/Vb
                  </div>
                  <div className='text-grey-d1'>{item.text1}</div>
                  <div className='text-grey-d1'>{item.text2}</div>
                </button>
              ))}

              <button
                className={`d-btn d-btn-block ${
                  3 == feeRateIndex && 'd-btn-primary'
                }`}
                onClick={() => !isLoading && setFeeRateIndex(3)}
              >
                <div className='py-2 text-4xl'>Custom</div>
              </button>
            </div>
            {feeRateIndex == 3 && (
              <div className='flex justify-center w-full mt-8'>
                <div className='md:w-1/2'>
                  <input
                    className='p-8 text-center input'
                    type='number'
                    value={customFeeRate}
                    onChange={e => setCustomFeeRate(e.target.value)}
                    placeholder='sat/Vb'
                    min={0}
                  />
                </div>
              </div>
            )}
            <div className='btn-group'>
              <button
                className='d-btn d-btn-primary active'
                onClick={handlePurchase}
              >
                {isLoading && <span className='loader-animation'></span>}
                Yes
              </button>
              <button
                className='d-btn d-btn-outline'
                onClick={() => {
                  closeModal()
                  setIsLoading(false)
                }}
              >
                No
              </button>
            </div>
          </section>
        </ReactPortal>
      )}
      <section className='home__container'>
        <section className='home__content'>
          <h1 className='py-12 mb-5 text-center'>Welcome to the Bitcoin Unisat Wallet, Hiro Wallet, Xverse Wallet</h1>


          <section className='home__details'>
            <div className='flex flex-wrap justify-center gap-12 mb-12 info lg:justify-between'>
              <div className='flex items-center justify-center flex-1 gap-8 token'>
                <a
                  // href='https://unisat.io/brc20/OXIN'
                  // target='_blank'
                  rel='noreferrer'
                >
                  <div className='flex gap-8'>
                    <h3>{connected && address}</h3>
                    <CopyIcon classes={'icon-xs'} />
                  </div>
                </a>
              </div>
              <div
                className='flex items-center justify-center gap-8 how'
                onClick={() => setToggleSteps(true)}
              >               
              </div>
            </div>

            
            {!connected  &&  <ConnectBtn />}
            {lastOrder && (
              <>
                <div className='flex justify-center mt-8 hint'>
                  Last order status: {orderStatusStings[lastOrder.order_status]}
                  {lastOrder.order_status == 5 && ` (${lastOrder.description})`}
                </div>
                <div className='flex justify-center mt-8 hint'>
                  <span className='px-2'>Transaction: </span>
                  <a
                    className='primary-color'
                    href={
                      BTCNETWORK === 0
                        ? BTCTestExplorerUrl + lastOrder.txid
                        : BTCMainExplorerUrl + lastOrder.txid
                    }
                    target='_blank'
                    rel='noreferrer'
                  >
                    {lastOrder.txid.slice(0, 10) +
                      '...' +
                      lastOrder.txid.slice(-10)}
                  </a>
                </div>
              </>
            )}
          </section>
        </section>

      
      </section>
      {modalState.addModalContainer && (
        <section className='modal__container backdrop__container' id='modal' />
      )}
    </>
  )
}

export default Home

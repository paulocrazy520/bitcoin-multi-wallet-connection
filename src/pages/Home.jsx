import React, { useEffect, useState } from 'react'

import CopyIcon from '../assets/icons/CopyIcon'
import { useAuthState } from '../context/AuthContext'
import WalletIcon from '../assets/icons/WalletIcon'
import { validate, getAddressInfo } from 'bitcoin-address-validation'
import useToast from '../hooks/useToast'
import {
  BTCNETWORK,
} from '../utils/constants'
import { useModalState } from '../context/ModalContext'
import ReactPortal from '../components/ReactPortal'


function Home() {
  const { walletContext } = useAuthState()
  const {
    walletIndex,
    setWalletIndex,
    connectWallet,
    address,
    connected,
    network,
    sendBitcoin,
    walletList,
    setWalletList,
    balance,
    disconnectWallet
  } = walletContext


  const [isLoading, setIsLoading] = useState(false)
  const { modalState, openModal, closeModal, addModal, removeModal } =
    useModalState()

  const ConnectBtn = () => (
    <button
      className='flex items-center mx-auto text-4xl d-btn d-btn-primary active'
      onClick={() => {
        setWalletList(!walletList)
      }}
    >
      <WalletIcon viewBox='0 0 22 22' classes='icon' />
      Connect Wallet
    </button>
  )


  const DisconnectBtn = () => (
    <button
      className='flex items-center gap-8 mx-auto text-4xl d-btn d-btn-primary active'
      onClick={disconnectWallet}
    >
      <WalletIcon viewBox='0 0 22 22' classes='icon' />
      Disconnect Wallet
    </button>
  )


  return (
    <>
      {modalState.open && (
        <ReactPortal>
          <section className='modal__content'>
            <h2 className='leading-normal'>{`Are you sure to buy ${oxinAmount} oxin with ${calcFee()} BTC?`}</h2>
            <div className='flex flex-wrap justify-center w-full gap-8 mt-16'>

              <button
                className={`d-btn d-btn-block ${3 == feeRateIndex && 'd-btn-primary'
                  }`}
                onClick={() => !isLoading && setFeeRateIndex(3)}
              >
                <div className='py-2 text-4xl'>Custom</div>
              </button>
            </div>

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
            <div className='flex flex-col flex-wrap justify-center gap-12 mb-12 info lg:justify-between'>
              <div className='flex flex-col items-center justify-center flex-1 gap-8 token'>

                <div className='flex flex-col gap-8 py-10'>
                  <div className='flex flex-row gap-8'>
                    <span><CopyIcon classes={'icon-xs'} /></span>
                    <h3>{connected && address}</h3>

                  </div>
                  {connected && <h3 className='mt-10 !text-[#ff0000]'>{`Balance: ${balance}`}</h3>}
                </div>

                {!connected ? <ConnectBtn /> : <DisconnectBtn />}
              </div>
            </div>
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

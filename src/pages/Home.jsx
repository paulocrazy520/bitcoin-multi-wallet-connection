import React, { useEffect, useState } from 'react'

import { useAuthState } from '../context/AuthContext'
import WalletIcon from '../assets/icons/WalletIcon'
import useToast from '../hooks/useToast'
import { useModalState } from '../context/ModalContext'
import ReactPortal from '../components/ReactPortal'
import {formatBTCNumber} from '../utils/constants'

function Home() {
  const { walletContext } = useAuthState()
  const {
    address,
    connected,
    walletList,
    setWalletList,
    balance,
    disconnectWallet,
    sendSignMessage
  } = walletContext
  const { messageApi } = useToast();

  const { authState, updateTheme } = useAuthState()
  const [isLoading, setIsLoading] = useState(false)
  const [strSignMessage, setStrSignMessage] = useState("");
  const [strSignature, setStrSignature] = useState("");
  const { modalState, openModal, closeModal, addModal, removeModal } =
    useModalState()

  const handleSignMessage = async () => {
    try {
      const signature = await sendSignMessage(strSignMessage);
      setStrSignature(signature)
      if (signature)
        messageApi.notifyWarning(signature, 3)
    }
    catch (e) {
      console.log(e);
    }
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

  const DisconnectBtn = () => (
    <button
      className='flex items-center gap-8 mx-auto text-4xl d-btn d-btn-primary active'
      onClick={disconnectWallet}
    >
      <WalletIcon viewBox='0 0 22 22' classes='icon' />
      Disconnect Wallet
    </button>
  )

  const SignBtn = () => (
    <button
      className='flex items-center gap-8 mx-auto text-4xl d-btn d-btn-primary active'
      onClick={() => handleSignMessage()}
    >
      <WalletIcon viewBox='0 0 22 22' classes='icon' />
      Sign Message
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
          <h1 className='py-12 mb-5 text-center text-red-500'>Unisat, Leather, Xverse Bitcoin Wallet</h1>

          <section className='home__details'>
            <div className='flex flex-col flex-wrap justify-center gap-12 mb-12 info lg:justify-between'>
              <div className='flex flex-col items-center justify-center flex-1 gap-8 token'>
                <div className='w-full py-2 text-center border-b'><h2>Basic Info</h2></div>
                {connected && <div className='flex flex-col gap-8'>
                  <div className='flex flex-row items-center gap-8'>
                    <h3>Address:</h3>
                    <h3 className={ !authState.preferDark && '!text-black'}>{address}</h3>
                  </div>
                  <div className='flex flex-row items-center gap-8'>
                    <h3>Balance:</h3>
                    <h3 className={ !authState.preferDark && '!text-black'}>{formatBTCNumber(balance)}</h3>
                  </div>
                </div>}
                {!connected ? <ConnectBtn /> : <DisconnectBtn />}
              </div>
            </div>

            {connected && <div className='flex flex-col flex-wrap justify-center gap-12 mb-12 info lg:justify-between'>
              <div className='flex flex-col items-center justify-center flex-1 gap-8 token'>
                <div className='w-full py-2 text-center border-b'><h2>Sign Message</h2></div>
                <div className='flex flex-col gap-8'>
                  <div className='flex flex-row items-center gap-8'>
                    <h3>Message:</h3>
                    <input type="text" className={`${authState.preferDark && '!text-black'} border text-[30px] py-3`} onChange={(e) => setStrSignMessage(e.target.value)} />
                  </div>
                  <div className='flex flex-row items-start w-full max-w-lg gap-8 break-words'>
                    <h3>Signature:</h3>
                    <h3 className={`${!authState.preferDark && '!text-black'} w-full`}>{strSignature}</h3>
                  </div>
                </div>
                <SignBtn />
              </div>
            </div>}
          </section>
        </section>

      </section >
      {
        modalState.addModalContainer && (
          <section className='modal__container backdrop__container' id='modal' />
        )
      }
    </>
  )
}

export default Home

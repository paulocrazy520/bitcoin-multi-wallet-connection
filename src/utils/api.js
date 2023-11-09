/* eslint-disable */
const express = require('express')
const parser = require('body-parser')
const cors = require('cors')
const https = require('https')

const {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} = require('fs')

const MempoolJS = require('@mempool/mempool.js')
const { MongoClient } = require('mongodb')

const {
  NETWORK,
  VAULT_ADDRESS,
  MONGODB_URI,
  DB_NAME,
  COLLECTION_NAME,
  FRONT_SERVER,
  TOKEN_NAME,
  TOKEN_ADDRESS,
  TOKEN_PRICE,
  MIN_TOKEN_AMOUNT,
  MAX_TOKEN_AMOUNT,
  PRESALE_TOKEN_SUPPLY,
  MAX_PENDING_ORDER_COUNT,
  STATIC_FEE,
  DYNAMIC_FEE,
  PRESALE_START_TIME,
  PRESALE_END_TIME,
  INSCRIPTION_PATH,
} = require('./config.js')

const {
  waitForSeconds,
} = require('./util.js')

const {
  inscribeOrdinal,
  sendOrdinal,
} = require('./ord-wallet.js')

////////////////////////////////////////////////////////////////

const ORDER_STATUS_ORDERED = 1
const ORDER_STATUS_FEE_TRANSACTION_CONFIRMED = 2
const ORDER_STATUS_TOKEN_TRANSFER_INSCRIBED = 3
const ORDER_STATUS_TOKEN_TRANSFERED = 4
const ORDER_STATUS_FAILED = 5
const ORDER_STATUS_CONFIRMED = 6

const BRC20_PROTOCOL = 'brc-20'

const app = express()

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.use(cors())

const privateKey = readFileSync('key.pem', 'utf8')
const certificate = readFileSync('cert.pem', 'utf8')
const credentials = {
  key: privateKey,
  cert: certificate,
}

// const server = https.createServer(credentials, app)

const mempool = MempoolJS({
  hostname: 'mempool.space',
  network: NETWORK,
  timeout: 60000,
})

const bitcoin = mempool.bitcoin

const mongoClient = new MongoClient(MONGODB_URI)

const mongodb = mongoClient.db(DB_NAME)
const orderCollection = mongodb.collection(COLLECTION_NAME)

let lastBlockHeight = 0

const WAIT_TIME = 10

const DIR_PATH = `${INSCRIPTION_PATH}/transfer/${TOKEN_NAME}`

if (!existsSync(DIR_PATH)) {
  mkdirSync(DIR_PATH)
}

////////////////////////////////////////////////////////////////

async function inscribe_transfer_brc20(amount, destination, feeRate) {
  const transferInfo = {
    p: BRC20_PROTOCOL,
    op: 'transfer',
    tick: TOKEN_NAME,
    amt: amount.toString(),
  }

  const inscriptionPath = `${DIR_PATH}/${destination}-${amount}.txt`
  writeFileSync(inscriptionPath, JSON.stringify(transferInfo))

  return await inscribeOrdinal(inscriptionPath, destination, feeRate)
}

const getInscriptionSats = async (inscription) => {
  try {
    const parts = inscription.split('i')
    const txid = parts[0]
    const vout = parts[1]

    const tx = await bitcoin.transactions.getTx({ txid })

    if (tx && tx.status.confirmed) {
      return tx.vout[vout].value
    }
  } catch (error) {
    console.error
  }
}

const getTransactionFee = async (txid) => {
  try {
    const tx = await bitcoin.transactions.getTx({ txid })

    if (tx && tx.status.confirmed) {
      return tx.fee
    }
  } catch (error) {
    console.error
  }
}

const getTransaction = async (txid) => {
  try {
    let tx = null
    let waitTime = 0

    while (!tx && waitTime < WAIT_TIME) {
      try {
        waitTime++
        await waitForSeconds(1)
        tx = await bitcoin.transactions.getTx({ txid })
      } catch (error) {
      }
    }

    return tx
  } catch (error) {
    console.error(error)
  }
}

async function checkOrder(order) {
  try {
    if (!order.btc_sender_address
      || !order.token_receiver_address
      || !order.btc_amount
      || !order.token_amount
      || !order.fee_rate) {
      order.description = 'Invalid parameter'
      return
    }

    const time = Date.now()

    if (time < PRESALE_START_TIME || time > PRESALE_END_TIME) {
      order.description = 'Invalid time'
      return
    }

    order.btc_amount = Number(order.btc_amount)
    order.token_amount = Number(order.token_amount)

    if (order.btc_amount < order.token_amount * TOKEN_PRICE) {
      order.description = 'Insufficient BTC amount'
      return
    }

    if (order.token_amount < MIN_TOKEN_AMOUNT || order.token_amount > MAX_TOKEN_AMOUNT) {
      order.description = 'Invalid token amount'
      return
    }

    const confirmedOrders = await orderCollection.find({ order_status: ORDER_STATUS_CONFIRMED }).toArray()

    let transferedTokenAmount = 0

    for (const confirmedOrder of confirmedOrders) {
      transferedTokenAmount += confirmedOrder.token_amount
    }

    if (transferedTokenAmount > PRESALE_TOKEN_SUPPLY) {
      order.description = 'Exceed presale token supply'
      return
    }

    const pendingOrders = await orderCollection.find({ order_status: { $lt: ORDER_STATUS_FAILED } }).toArray()

    if (pendingOrders && pendingOrders.length > MAX_PENDING_ORDER_COUNT) {
      order.description = 'Exceed max pending order count'
      return
    }

    const prevOrders = await orderCollection.find({ token_receiver_address: order.token_receiver_address }).toArray()

    let prevTransferedTokenAmount = 0

    for (const prevOrder of prevOrders) {
      prevTransferedTokenAmount += prevOrder.token_amount
    }

    if (prevTransferedTokenAmount > MAX_TOKEN_AMOUNT) {
      order.description = 'Max token amount reached'
      return
    }

    return true
  } catch (error) {
    console.error(error)
  }
}

async function orderThread() {
  while (true) {
    try {
      const blockHeight = await bitcoin.blocks.getBlocksTipHeight()

      if (blockHeight > lastBlockHeight) {
        const orders = await orderCollection.find({ order_status: { $lt: ORDER_STATUS_FAILED } }).toArray()

        for (const order of orders) {
          try {
            switch (order.order_status) {
              case ORDER_STATUS_ORDERED:
                const txs = await orderCollection.find({ txid: order.txid }).toArray()

                if (txs.length > 1) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Duplicated fee transaction'
                  break
                }

                let tx = await getTransaction(order.txid)

                if (!tx) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Fee transaction not exist'
                  break
                } else if (!tx.status.confirmed) {
                  break
                }

                let validSendAddress = true

                for (const vin of tx.vin) {
                  if (vin.prevout.scriptpubkey_address !== order.btc_sender_address) {
                    validSendAddress = false
                    break
                  }
                }

                if (!validSendAddress) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Invalid send address'
                  break
                }

                let btcBalance = 0
                let invalidTransaction = true

                for (const vout of tx.vout) {
                  if (vout.scriptpubkey_address === VAULT_ADDRESS) {
                    btcBalance += vout.value
                    invalidTransaction = false
                  }
                }

                if (invalidTransaction) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Invalid transaction'
                  break
                }

                order.btc_balance = btcBalance
                order.spent_fee = 0

                const minBtcAmount = order.btc_amount + STATIC_FEE + DYNAMIC_FEE * order.fee_rate

                if (order.btc_balance < minBtcAmount) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Insufficient BTC balance'
                  break
                }

                order.order_status = ORDER_STATUS_FEE_TRANSACTION_CONFIRMED
                order.description = 'Fee transaction confirmed'
              case ORDER_STATUS_FEE_TRANSACTION_CONFIRMED:
                const tokenTransfer = await inscribe_transfer_brc20(order.token_amount, TOKEN_ADDRESS, order.fee_rate)

                if (!tokenTransfer) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Token transfer inscribe failed'
                  break
                }

                order.token_transfer = tokenTransfer

                order.order_status = ORDER_STATUS_TOKEN_TRANSFER_INSCRIBED
                order.description = 'Token transfer inscribed'
              case ORDER_STATUS_TOKEN_TRANSFER_INSCRIBED:
                const inscribeTokenTransferTx = await getTransaction(order.token_transfer.reveal)

                if (!inscribeTokenTransferTx) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Inscribe token transfer transaction not exist'
                  break
                } else if (!inscribeTokenTransferTx.status.confirmed) {
                  break
                }

                order.spent_fee += order.token_transfer.fees
                order.spent_fee += await getInscriptionSats(order.token_transfer)

                const tokenSendTxid = await sendOrdinal(order.token_transfer.inscription, order.token_receiver_address, order.fee_rate)

                if (!tokenSendTxid) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Token transfer failed'
                  break
                }

                order.token_send_txid = tokenSendTxid
                order.order_status = ORDER_STATUS_TOKEN_TRANSFERED
                order.description = 'Token transfered'
              case ORDER_STATUS_TOKEN_TRANSFERED:
                const tokenSendTx = await getTransaction(order.token_send_txid)

                if (!tokenSendTx) {
                  order.order_status = ORDER_STATUS_FAILED
                  order.description = 'Token send transaction not exist'
                } else if (!tokenSendTx.status.confirmed) {
                  break
                }

                order.spent_fee += await getTransactionFee(order.token_send_txid)

                order.order_status = ORDER_STATUS_CONFIRMED
                order.description = 'Confirmed'
                break
            }

            await orderCollection.updateOne({ _id: order._id }, { $set: order })
          } catch (error) {
            console.error(error)
          }
        }

        lastBlockHeight = blockHeight
      }

      await waitForSeconds(WAIT_TIME)
    } catch (error) {
      console.error(error)
    }
  }
}

app.get('/currenttime', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'GET')

    res.send(JSON.stringify({ status: 'success', data: Date.now() }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

app.get('/getvaultaddress', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'POST')

    res.send(JSON.stringify({ status: 'success', data: VAULT_ADDRESS }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

app.post('/checkorder', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'POST')

    const order = req.body

    if (!(await checkOrder(order))) {
      res.send(JSON.stringify({ status: 'error', description: order.description }))
      return
    }

    res.send(JSON.stringify({ status: 'success' }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

app.post('/getorder', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'POST')

    const orders = await orderCollection.find(req.body).toArray()

    res.send(JSON.stringify({ status: 'success', data: orders }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

app.post('/buytoken', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'POST')

    const order = req.body
    order.timestamp = Date.now()

    const result = await orderCollection.insertOne(order)
    order._id = result.insertedId

    if (!(await checkOrder(order))) {
      order.order_status = ORDER_STATUS_FAILED
      await orderCollection.updateOne({ _id: order._id }, { $set: order })

      res.send(JSON.stringify({ status: 'error', description: order.description }))
      return
    }

    order.order_status = ORDER_STATUS_ORDERED
    order.description = 'Ordered'
    await orderCollection.updateOne({ _id: order._id }, { $set: order })

    res.send(JSON.stringify({ status: 'success' }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

module.exports = {
  orderThread,
  server: app,
}

import axios from "axios"
import { factoryWalletApi, getOrderListApi, getTransferedTokenAmountApi, getWalletTransactionApi, getfeeconstantApi } from "./apiRoutes"

export const getOrderList = async (address) => {
  try {
    const { data } = await axios.post(getOrderListApi, { btc_sender_address: address });
    // console.log('getOrderListApi :>> ', data);
    return data.data
  } catch (error) {
    return []
  }
}

export const getVaultaddress = async () => {
  try {
    const { data } = await axios.get(factoryWalletApi);
    // console.log('getVaultaddress :>> ', data);
    return data.data
  } catch (error) {
    return ''
  }
}

export const getFeeConstant = async () => {
  try {
    const { data } = await axios.get(getfeeconstantApi);
    console.log('getfeeconstantApi :>> ', data.data);
    return data.data;
  } catch (error) {
    return null;
  }
}

export const getWalletTransaction = async () => {
  try {
    const { data } = await axios.get(getWalletTransactionApi);
    console.log('getWalletTransactionApi :>> ', data.data);
    return data.data;
  } catch (error) {
    return null;
  }
}
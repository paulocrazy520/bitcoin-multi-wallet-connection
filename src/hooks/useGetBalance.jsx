import axios from "axios"
import { useEffect } from "react"
import { host } from "../utils/apiRoutes"

const mainHost = host;
const getBTCBalanceApi = `${mainHost}/getbtcbalance/`;
const getTokenBalanceApi = `${mainHost}/gettransferedtokenamount/`


export default function useGetBalance() {

  const getBTCBalance = async (address) => {
    try {
      const { data } = await axios.get(getBTCBalanceApi + address);
      console.log('getBTCBalanceApi :>> ', data);
      return data.data||0;
    } catch (error) {
      return 0;
    }
  }

  const getTokenBalance = async (token, address) => {
    try {
      const { data } = await axios.get(getTokenBalanceApi + address);
      console.log('getTokenBalance :>> ', data);
      return data.data
    } catch (error) {
      return 0;
    }
  }

  return [getBTCBalance, getTokenBalance];
}
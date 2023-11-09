import axios from "axios";
import { useEffect, useState } from "react";
import { getTransferedTokenAmountApi } from "../utils/apiRoutes";


export function useGetTotalAmount() {
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchAmount = async () => {
    try {
      const { data } = await axios.get(getTransferedTokenAmountApi);
      const percent = 100 * data.data / 5.2e6;
      setTotalAmount(percent, data.data);
      console.log('percent :>> ', percent);
    } catch (error) {
      console.log('error :>> ', error);
    }
  }

  useEffect(() => {
    fetchAmount()
    const timer = setInterval(() => {
      fetchAmount();
    }, 60000);
    return clearTimeout(timer);
  }, [])

  return [totalAmount];
}
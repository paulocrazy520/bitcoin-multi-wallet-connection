import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { getWhiteListApi } from '../utils/apiRoutes'

export default function useWhiteListed(address, address2) {
  const [whiteListed, setWhiteListed] = useState(false)
  useEffect(() => {
    const checkWhiteList = async () => {
      try {
        const { data: data } = await axios.get(getWhiteListApi + address)
        const { data: data2 } = await axios.get(getWhiteListApi + address2)
        console.log('data :>> ', data, data2)
        setWhiteListed(data.data || data2.data)
      } catch (error) {
        setWhiteListed(false)
      }
    }
    const timeout = setTimeout(() => {
      checkWhiteList()
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [address, address2])

  return [whiteListed]
}

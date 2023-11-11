export const APP_MODE = true //false- test mode
export const BTCNETWORK = 1 //0- testnet 1-mainnet

export const formatTime = timestamp => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes() > 10 ? date.getMinutes() : '0' + date.getMinutes()
  if (hours < 10) return `0${hours}:${minutes} ${year}/${month}/${day}`
  else return `${hours}:${minutes} ${year}/${month}/${day}`
  // return `${year}.${month}.${day} ${hours}:${minutes}`
}

export const isStringEqual = (string1, string2) => {
  if (!string1 || !string2) return false
  return string1.tick.toUpperCase() === string2.tick.toUpperCase()
}

export const sleep = timeout => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(true)
    }, timeout * 1000)
  })
}

export function formatBTCNumber(num) {
  
  // Round the number to 8 decimal places
  let roundedNum = (num / (10 ** 8)).toFixed(8)

  // Convert the rounded number to a string
  let numString = roundedNum.replace(/\.?0+$/, '')
  // Remove trailing zeros after the decimal point

  return numString
}

import React, { useState, useEffect } from 'react'
import axios from 'axios'

import moment, { duration } from 'moment/moment'

const formatNumber = number => {
  if (number >= 10) return number.toString()
  else return '0' + number.toString()
}

const parseDuration = duration => {
  return {
    days: formatNumber(duration.days()),
    hours: formatNumber(duration.hours()),
    minutes: formatNumber(duration.minutes()),
    seconds: formatNumber(duration.seconds()),
  }
}

var date = new Date('June 19, 2023 00:00:00 UTC')
var utcDate = new Date(date.toUTCString())
var unixTimestamp = Math.floor(utcDate.getTime() / 1000)

var end_date = new Date('July 2, 2023 23:59:59 UTC')
var end_utcDate = new Date(end_date.toUTCString())
var end_unixTimestamp = Math.floor(end_utcDate.getTime() / 1000)

export default function useTime() {
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [deltaLocal, setDeltaLocal] = useState(0)
  const [remainingTimeStamp, setRemainingTimestamp] = useState(0)
  const [delta1, setDelta1] = useState(null)
  const [delta2, setDelta2] = useState(null)
  const [started, setStarted] = useState(false)
  const [startTime, setStarttimeStamp] = useState(null)
  const [endTime, setEndtimeStamp] = useState(null)
  const [ended, setEnded] = useState(false)

  const getCurrentTimestamp = async () => {
    // const { data } = await axios.get(worldTimeApi);
    // const { unixtime } = data;
    const { data } = await axios.get(getCurrentTimeApi)
    const unixtime = data.data / 1000
    const localMoment = moment()
    const worldMoment = moment.unix(unixtime)
    // console.log('unixtime :>> ', worldMoment, startTime);
    const deltaLocal = worldMoment - localMoment

    // console.log('worldMoment :>> ', worldMoment.format());
    // console.log('currentMome :>> ', localMoment.format());

    setCurrentTimestamp(localMoment)
    setDeltaLocal(deltaLocal)
  }

  const calculate = () => {
    const current = moment.unix((moment() + deltaLocal) / 1000)
    let delta1 = startTime - current
    const delta2 = endTime - current

    if (delta1 < 0) {
      delta1 = delta2
      setStarted(true)
    }
    if (delta2 < 0) {
      setStarted(false)
      setEnded(true)
      delta1 = 0
    }
    const duration1 = moment.duration(delta1)
    const duration2 = moment.duration(delta2)
    setDelta1(parseDuration(duration1))
    setDelta2(parseDuration(duration2))
  }

  useEffect(() => {
    console.log('startTime :>> ', startTime?.format('MMMM DD, HH:mm UTC'))
    getCurrentTimestamp()
    const interval = setInterval(() => {
      if (!startTime || !endTime) return
      calculate()
    }, 950)

    return () => {
      clearInterval(interval)
    }
  }, [startTime, endTime])

  useEffect(() => {
    const loadTimes = async () => {
      const { data: start } = await axios.get(getStarttimeApi)
      const { data: end } = await axios.get(getEndtimeApi)
      setStarttimeStamp(moment.unix(start.data / 1000))
      setEndtimeStamp(moment.unix(end.data / 1000))
    }
    loadTimes()
  }, [])

  return [currentTimestamp, delta1, delta2, started, startTime, endTime, ended]
}
